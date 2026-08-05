import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import * as argon2 from 'argon2';
import { AdministratorService } from 'src/administrator/administrator.service';
import { TokenService } from './token.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Administrator } from 'src/generated/prisma/client';
import { AdministratorLoginDto } from './dtos/administrator-login.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AdministratorSessionDto } from './dtos/administrator-session.dto';
import { JwtSubjectType } from './enums/jwt-subject-type.enum';
import { Tokens } from './interfaces/tokens.interface';
import { JwtPayload } from './interfaces/token-payload.interface';
import { AdminAuthUser } from './interfaces/admin-auth-user.interface';
import { DUMMY_PASSWORD_HASH } from 'src/common/constants/dummy-pass-hash.constant';

@Injectable()
export class AdminAuthService {
  private readonly csrfSecret: string;
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {
    this.csrfSecret = this.configService.getOrThrow<string>('app.csrfSecret');
  }

  async login(
    data: AdministratorLoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Tokens> {
    const administrator = await this.authenticateAdministrator(
      data.username,
      data.password,
    );

    // Create session identifier
    const sessionUuid = this.createSessionId();

    // Build JWT payload
    const payload: JwtPayload = {
      sub: administrator.administratorId,
      sid: sessionUuid,
      type: JwtSubjectType.ADMIN,
    };

    // Generate tokens
    const { accessToken, refreshToken, csrfToken } =
      await this.issueTokens(payload);

    // Hash secrets for storage
    const refreshTokenHash = await argon2.hash(refreshToken);

    const csrfTokenHash = this.hashToken(csrfToken);

    // Store only hashes of long-lived secrets
    await this.prisma.administratorSession.create({
      data: {
        sessionUuid,
        administratorId: administrator.administratorId,
        refreshTokenHash,
        csrfTokenHash,
        expiresAt: this.tokenService.getRefreshTokenExpiresAt(),
        lastUsedAt: new Date(),
        ipAddress,
        userAgent: this.normalizeUserAgent(userAgent),
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

    if (payload.type !== JwtSubjectType.ADMIN)
      throw new UnauthorizedException('Invalid token');

    // find administrator session
    const session = await this.prisma.administratorSession.findUnique({
      where: { sessionUuid: payload.sid },
    });

    if (!session) throw new UnauthorizedException('Session expired');

    if (session.revokedAt) throw new UnauthorizedException('Session revoked');

    if (session.expiresAt <= new Date())
      throw new UnauthorizedException('Session expired');

    if (session.administratorId !== payload.sub)
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

    const administrator = await this.administratorService.findById(
      session.administratorId,
    );

    if (!administrator)
      throw new UnauthorizedException('Administrator not found');

    if (!administrator.isActive)
      throw new UnauthorizedException('Administrator inactive');

    // Generate new tokens
    const tokens = await this.issueTokens({
      sub: administrator.administratorId,
      sid: session.sessionUuid,
      type: JwtSubjectType.ADMIN,
    });

    const refreshTokenHash = await argon2.hash(tokens.refreshToken);

    const csrfTokenHash = this.hashToken(tokens.csrfToken);

    // Only rotate if the stored hash is still the one we verified.
    const rotated = await this.prisma.administratorSession.updateMany({
      where: {
        administratorSessionId: session.administratorSessionId,
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
    await this.prisma.administratorSession.updateMany({
      where: { sessionUuid, revokedAt: null },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async logoutAll(administratorId: number): Promise<void> {
    await this.administratorService.revokeAllSessions(administratorId);
  }

  async changePassword(
    { administrator, session }: AdminAuthUser,
    data: ChangePasswordDto,
  ): Promise<void> {
    // check current password
    const isPasswordValid = await argon2.verify(
      administrator.passwordHash,
      data.currentPassword,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Wrong password');
    }

    // check if passwords are same
    const isSamePassword = await argon2.verify(
      administrator.passwordHash,
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
      await this.administratorService.updatePassword(
        administrator.administratorId,
        passwordHash,
        tx,
      );

      // revoke all sessions except current one
      await this.administratorService.revokeAllSessionsExceptCurrentOne(
        administrator.administratorId,
        session.sessionUuid,
        tx,
      );
    });
  }

  async listActiveSessions(
    administratorData: AdminAuthUser,
  ): Promise<AdministratorSessionDto[]> {
    const sessions = await this.administratorService.getActiveSessions(
      administratorData.administrator.administratorId,
    );

    return sessions.map((session) => ({
      sessionUuid: session.sessionUuid,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      current: session.sessionUuid === administratorData.session.sessionUuid,
    }));
  }

  private async authenticateAdministrator(
    username: string,
    password: string,
  ): Promise<Administrator> {
    const admin = await this.administratorService.findByUsername(username);

    const isPasswordValid = admin
      ? await argon2.verify(admin.passwordHash, password)
      : await argon2.verify(DUMMY_PASSWORD_HASH, password).catch(() => false);

    if (!admin || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return admin;
  }

  private async issueTokens(payload: JwtPayload): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ]);
    const csrfToken = this.generateToken();

    return { accessToken, refreshToken, csrfToken };
  }

  private normalizeUserAgent(value?: string): string | undefined {
    return value?.slice(0, 255);
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
