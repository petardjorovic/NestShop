import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/token-payload.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminCookies } from '../constants/cookie.constants';
import { JwtSubjectType } from '../enums/jwt-subject-type.enum';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: AuthRequest): string | null => {
          return req.cookies[AdminCookies.ACCESS] ?? null;
        },
      ]),
      secretOrKey: configService.getOrThrow<string>('app.jwtAccessSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== JwtSubjectType.ADMIN) {
      throw new UnauthorizedException('Invalid token type');
    }

    const session = await this.prisma.administratorSession.findUnique({
      where: { sessionUuid: payload.sid },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.administratorId !== payload.sub) {
      throw new UnauthorizedException('Invalid session');
    }

    if (session.revokedAt) {
      throw new UnauthorizedException('Session revoked');
    }

    if (session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    const administrator = await this.prisma.administrator.findUnique({
      where: { administratorId: payload.sub },
    });

    if (!administrator) {
      throw new UnauthorizedException('Administrator not found');
    }

    if (!administrator.isActive) {
      throw new UnauthorizedException('Administrator inactive');
    }

    return {
      administrator,
      session,
    };
  }
}
