import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AdministratorService } from 'src/administrator/administrator.service';
import { TokenService } from './token.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Administrator } from 'src/generated/prisma/client';
import { AdministratorLoginDto } from './dtos/administrator-login.dto';
import { randomBytes, randomUUID } from 'node:crypto';
import { JwtPayload } from './interfaces/token-payload.interface';
import { JwtSubjectType } from './enums/jwt-subject-type.enum';
import { Tokens } from './interfaces/tokens.interface';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async login(data: AdministratorLoginDto): Promise<Tokens> {
    const administrator = await this.authenticateAdministrator(
      data.username,
      data.password,
    );

    // Create session identifier
    const sessionUuid = randomUUID();

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
    const [refreshTokenHash, csrfTokenHash] = await Promise.all([
      argon2.hash(refreshToken),
      argon2.hash(csrfToken),
    ]);

    // Store only hashes of long-lived secrets
    await this.prisma.administratorSession.create({
      data: {
        sessionUuid,
        administratorId: administrator.administratorId,
        refreshTokenHash,
        csrfTokenHash,
        expiresAt: this.tokenService.getRefreshTokenExpiresAt(),
        lastUsedAt: new Date(),
      },
    });

    return { accessToken, refreshToken, csrfToken };
  }

  async refresh(refreshToken: string, csrfToken: string): Promise<Tokens> {
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

    const [isRefreshTokenValid, isCsrfTokenValid] = await Promise.all([
      argon2.verify(session.refreshTokenHash, refreshToken),
      argon2.verify(session.csrfTokenHash, csrfToken),
    ]);

    if (!isRefreshTokenValid)
      throw new UnauthorizedException('Invalid refresh token');

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

    const [refreshTokenHash, csrfTokenHash] = await Promise.all([
      argon2.hash(tokens.refreshToken),
      argon2.hash(tokens.csrfToken),
    ]);

    await this.prisma.administratorSession.update({
      where: { administratorSessionId: session.administratorSessionId },
      data: {
        refreshTokenHash,
        csrfTokenHash,
        lastUsedAt: new Date(),
      },
    });

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

  private async authenticateAdministrator(
    username: string,
    password: string,
  ): Promise<Administrator> {
    const admin = await this.administratorService.findByUsername(username);

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(admin.passwordHash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return admin;
  }

  private async issueTokens(payload: JwtPayload): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ]);
    const csrfToken = randomBytes(32).toString('hex');

    return { accessToken, refreshToken, csrfToken };
  }
}
