import { VerificationTokenService } from 'src/verification-token/verification-token.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { UserRegistrationDto } from './dtos/user-registration.dto';
import { VerificationType } from 'src/generated/prisma/enums';
import { UserLoginDto } from './dtos/user-login.dto';
import { User } from 'src/generated/prisma/client';
import { randomBytes, randomUUID } from 'node:crypto';
import { JwtPayload } from './interfaces/token-payload.interface';
import { JwtSubjectType } from './enums/jwt-subject-type.enum';
import { Tokens } from './interfaces/tokens.interface';
import { TokenService } from './token.service';

@Injectable()
export class UserAuthService {
  private readonly frontendUrl: string;
  private readonly logger = new Logger(UserAuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly verificationTokenService: VerificationTokenService,
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {
    this.frontendUrl = this.configService.getOrThrow<string>('app.frontendUrl');
  }

  async register(data: UserRegistrationDto) {
    // normalize email address
    const email = data.email.trim().toLowerCase();

    // check if user email already exists
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const phoneNumber = data.phoneNumber.trim();

    // check if user phone number already exists
    const existingPhone = await this.userService.findByPhoneNumber(phoneNumber);

    if (existingPhone) {
      throw new ConflictException('Phone already exists');
    }

    // hash user password
    const passwordHash = await argon2.hash(data.password);

    // create user and verification token
    const { user, token } =
      await this.userService.createUserWithVerificationToken({
        email,
        passwordHash,
        forename: data.forename,
        surname: data.surname,
        phoneNumber,
        postalAddress: data.postalAddress,
        expiresInHours: 24,
        verificationType: VerificationType.EMAIL_VERIFICATION,
      });

    const url = this.createVerificationUrl(token);

    // send email
    try {
      await this.mailService.sendVerifyEmail(user.forename, user.email, url);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${user.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async login(
    data: UserLoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Tokens> {
    const email = data.email.trim().toLowerCase();
    const user = await this.authenticateUser(email, data.password);

    // Create session identifier
    const sessionUuid = this.createSessionId();

    // Build JWT payload
    const payload: JwtPayload = {
      sub: user.userId,
      sid: sessionUuid,
      type: JwtSubjectType.USER,
    };

    // Generate tokens
    const { accessToken, refreshToken, csrfToken } =
      await this.issueTokens(payload);

    // Hash secrets for storage
    const [refreshTokenHash, csrfTokenHash] = await Promise.all([
      argon2.hash(refreshToken),
      argon2.hash(csrfToken),
    ]);

    // Store only hashes of long-lived secrets
    await this.prisma.userSession.create({
      data: {
        sessionUuid,
        userId: user.userId,
        refreshTokenHash,
        csrfTokenHash,
        expiresAt: this.tokenService.getRefreshTokenExpiresAt(),
        lastUsedAt: new Date(),
        ipAddress,
        userAgent,
      },
    });

    return { accessToken, refreshToken, csrfToken };
  }

  async refresh(
    refreshToken: string,
    csrfToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Tokens> {
    // verify refresh JWT
    const payload: JwtPayload =
      await this.tokenService.verifyRefreshToken(refreshToken);

    if (payload.type !== JwtSubjectType.USER) {
      throw new UnauthorizedException('Invalid token');
    }

    // find user session
    const session = await this.prisma.userSession.findUnique({
      where: { sessionUuid: payload.sid },
    });

    if (!session) throw new UnauthorizedException('Session invalid');

    if (session.revokedAt) throw new UnauthorizedException('Session revoked');

    if (session.expiresAt <= new Date())
      throw new UnauthorizedException('Session expired');

    if (session.userId !== payload.sub)
      throw new UnauthorizedException('Invalid session');

    const [isRefreshTokenValid, isCsrfTokenValid] = await Promise.all([
      argon2.verify(session.refreshTokenHash, refreshToken),
      argon2.verify(session.csrfTokenHash, csrfToken),
    ]);

    if (!isRefreshTokenValid)
      throw new UnauthorizedException('Invalid refresh token');

    if (!isCsrfTokenValid)
      throw new UnauthorizedException('Invalid csrf token');

    const user = await this.userService.findById(session.userId);

    if (!user) throw new UnauthorizedException('User not found');

    if (!user.isActive) throw new UnauthorizedException('User inactive');

    if (!user.emailVerifiedAt)
      throw new UnauthorizedException('User not verified');

    // Generate new tokens
    const tokens = await this.issueTokens({
      sub: user.userId,
      sid: session.sessionUuid,
      type: JwtSubjectType.USER,
    });

    const [refreshTokenHash, csrfTokenHash] = await Promise.all([
      argon2.hash(tokens.refreshToken),
      argon2.hash(tokens.csrfToken),
    ]);

    await this.prisma.userSession.update({
      where: { userSessionId: session.userSessionId },
      data: {
        refreshTokenHash,
        csrfTokenHash,
        lastUsedAt: new Date(),
        ipAddress,
        userAgent,
      },
    });

    return tokens;
  }

  async logout(sessionUuid: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { sessionUuid, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.verificationTokenService.verify(
      token,
      VerificationType.EMAIL_VERIFICATION,
    );

    await this.prisma.$transaction(async (tx) => {
      await this.userService.verifyEmail(verificationToken.userId, tx);

      await this.verificationTokenService.markAsUsed(
        verificationToken.verificationTokenId,
        tx,
      );
    });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email.trim().toLowerCase());

    if (!user) {
      return;
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('User already verified');
    }

    const token = await this.verificationTokenService.create(
      user.userId,
      VerificationType.EMAIL_VERIFICATION,
      24,
    );

    const url = this.createVerificationUrl(token);

    await this.mailService.sendVerifyEmail(user.forename, user.email, url);
  }
  // TODO
  // forgotPassword() {}
  // resetPassword() {}
  // changePassword() {}
  // listActiveSessions() {}
  // logoutFromallDevices() {}

  private async authenticateUser(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User inactive');
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('User not verified');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private createVerificationUrl(token: string): string {
    return `${this.frontendUrl}/verify-email?token=${token}`;
  }

  private async issueTokens(payload: JwtPayload): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ]);

    const csrfToken = randomBytes(32).toString('hex');

    return { accessToken, refreshToken, csrfToken };
  }

  private createSessionId(): string {
    return randomUUID();
  }
}
