import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AdministratorService } from 'src/administrator/administrator.service';
import { TokenService } from './token.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Administrator } from 'src/generated/prisma/client';
import { AdministratorLoginDto } from './dtos/administrator-login.dto';
import { randomUUID } from 'node:crypto';
import { JwtPayload } from './interfaces/token-payload.interface';
import { JwtSubjectType } from './enums/jwt-subject-type.enum';
import { TokenPair } from './interfaces/token-pair.interface';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  private async authenticateAdministrator(
    username: string,
    password: string,
  ): Promise<Administrator> {
    const admin = await this.administratorService.findByUsername(username);

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(admin.passwordHash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return admin;
  }

  async login(data: AdministratorLoginDto): Promise<TokenPair> {
    const administrator = await this.authenticateAdministrator(
      data.username,
      data.password,
    );

    const sessionUuid = randomUUID();

    // create payload
    const payload: JwtPayload = {
      sub: administrator.administratorId,
      sid: sessionUuid,
      type: JwtSubjectType.ADMIN,
    };

    // sign tokens
    const accessToken = await this.tokenService.signAccessToken(payload);
    const refreshToken = await this.tokenService.signRefreshToken(payload);

    // save refresh hash
    const refreshTokenHash = await argon2.hash(refreshToken);

    // create session
    await this.prisma.administratorSession.create({
      data: {
        sessionUuid,
        administratorId: administrator.administratorId,
        refreshTokenHash,
        expiresAt: this.tokenService.getRefreshTokenExpiresAt(),
        lastUsedAt: new Date(),
      },
    });

    return { accessToken, refreshToken };
  }
}
