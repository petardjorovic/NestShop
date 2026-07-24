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

  // TODO
  // async refresh(){}
  // async logout(){}

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
