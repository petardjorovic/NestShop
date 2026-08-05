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
import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import { JwtPayload } from './interfaces/token-payload.interface';
import { JwtSubjectType } from './enums/jwt-subject-type.enum';
import { Tokens } from './interfaces/tokens.interface';
import { TokenService } from './token.service';
import { DUMMY_PASSWORD_HASH } from 'src/common/constants/dummy-pass-hash.constant';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { UserAuthUser } from './interfaces/user-auth-user.interface';
import { UserSessionDto } from './dtos/user-session.dto';

@Injectable()
export class UserAuthService {
  private readonly frontendUrl: string;
  private readonly logger = new Logger(UserAuthService.name);
  private readonly csrfSecret: string;

  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly verificationTokenService: VerificationTokenService,
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {
    this.frontendUrl = this.configService.getOrThrow<string>('app.frontendUrl');
    this.csrfSecret = this.configService.getOrThrow<string>('app.csrfSecret');
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
    const refreshTokenHash = await argon2.hash(refreshToken);
    const csrfTokenHash = this.hashToken(csrfToken);

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

    const isRefreshTokenValid = await argon2.verify(
      session.refreshTokenHash,
      refreshToken,
    );

    if (!isRefreshTokenValid)
      throw new UnauthorizedException('Invalid refresh token');

    const isCsrfTokenValid = this.verifyToken(session.csrfTokenHash, csrfToken);

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

    const refreshTokenHash = await argon2.hash(tokens.refreshToken);

    const csrfTokenHash = this.hashToken(tokens.csrfToken);

    // Only rotate if the stored hash is still the one we verified.
    const rotated = await this.prisma.userSession.updateMany({
      where: {
        userSessionId: session.userSessionId,
        refreshTokenHash: session.refreshTokenHash,
        revokedAt: null,
      },
      data: {
        refreshTokenHash,
        csrfTokenHash,
        lastUsedAt: new Date(),
        ipAddress,
        userAgent,
      },
    });

    if (rotated.count === 0) {
      // The token was already rotated. Treat this as replay.
      await this.logout(session.sessionUuid);
      throw new UnauthorizedException('Session invalid');
    }

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
      this.logger.debug(
        `Resend verification requested for an already verified account: ${user.userId}`,
      );
      return;
    }

    const token = await this.verificationTokenService.create(
      user.userId,
      VerificationType.EMAIL_VERIFICATION,
      24,
    );

    const url = this.createVerificationUrl(token);

    await this.mailService.sendVerifyEmail(user.forename, user.email, url);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email.trim().toLowerCase());

    if (!user) {
      return;
    }

    if (!user.isActive) {
      return;
    }

    if (!user.emailVerifiedAt) {
      this.logger.debug(
        `Forgot password requested for a non-verified account: ${user.userId}`,
      );
      return;
    }

    const token = await this.verificationTokenService.create(
      user.userId,
      VerificationType.PASSWORD_RESET,
      1,
    );

    const url = this.createPasswordResetUrl(token);

    try {
      await this.mailService.sendPasswordResetEmail(
        user.email,
        user.forename,
        url,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${user.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async resetPassword(data: ResetPasswordDto) {
    // verify token
    const verificationToken = await this.verificationTokenService.verify(
      data.token,
      VerificationType.PASSWORD_RESET,
    );

    // hash new password
    const newPasswordHash = await argon2.hash(data.password);

    // transaction
    await this.prisma.$transaction(async (tx) => {
      // update user passwordHash
      await this.userService.updatePassword(
        verificationToken.userId,
        newPasswordHash,
        tx,
      );

      // mark token as used
      await this.verificationTokenService.markAsUsed(
        verificationToken.verificationTokenId,
        tx,
      );

      // revoke all user sessions
      await this.userService.revokeAllSessions(verificationToken.userId, tx);
    });
  }

  async changePassword(
    userData: UserAuthUser,
    data: ChangePasswordDto,
  ): Promise<void> {
    // check current password
    const isPasswordValid = await argon2.verify(
      userData.user.passwordHash,
      data.currentPassword,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Wrong password');
    }

    // check if passwords are same
    const isSamePassword = await argon2.verify(
      userData.user.passwordHash,
      data.newPassword,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // hash new password
    const passwordHash = await argon2.hash(data.newPassword);

    // transaction
    await this.prisma.$transaction(async (tx) => {
      // update user password
      await this.userService.updatePassword(
        userData.user.userId,
        passwordHash,
        tx,
      );

      // revoke all sessions except current one
      await this.userService.revokeAllSessionsExceptCurrentOne(
        userData.user.userId,
        userData.session.sessionUuid,
        tx,
      );
    });
  }

  async listActiveSessions(userData: UserAuthUser): Promise<UserSessionDto[]> {
    const sessions = await this.userService.getActiveSessions(
      userData.user.userId,
    );

    return sessions.map((session) => ({
      sessionUuid: session.sessionUuid,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      current: session.sessionUuid === userData.session.sessionUuid,
    }));
  }

  async logoutAll(userId: number): Promise<void> {
    await this.userService.revokeAllSessions(userId);
  }

  private async authenticateUser(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.userService.findByEmail(email);

    // Always spend the same work so timing does not disclose existence.
    const isPasswordValid = user
      ? await argon2.verify(user.passwordHash, password)
      : await argon2.verify(DUMMY_PASSWORD_HASH, password).catch(() => false);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User inactive');
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('User not verified');
    }

    return user;
  }

  private createVerificationUrl(token: string): string {
    return `${this.frontendUrl}/verify-email?token=${token}`;
  }

  private createPasswordResetUrl(token: string): string {
    return `${this.frontendUrl}/reset-password?token=${token}`;
  }

  private async issueTokens(payload: JwtPayload): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ]);

    const csrfToken = this.generateToken();

    return { accessToken, refreshToken, csrfToken };
  }

  private createSessionId(): string {
    return randomUUID();
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return createHmac('sha256', this.csrfSecret).update(token).digest('hex');
  }

  private verifyToken(csrfTokenHash: string, csrfToken: string): boolean {
    const candidateHash = this.hashToken(csrfToken);

    const expected = Buffer.from(csrfTokenHash, 'hex');
    const actual = Buffer.from(candidateHash, 'hex');

    if (expected.length !== actual.length) {
      return false;
    }

    return timingSafeEqual(expected, actual);
  }
}
