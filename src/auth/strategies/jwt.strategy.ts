import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { JwtPayload } from '../interfaces/token-payload.interface';
import { JwtSubjectType } from '../enums/jwt-subject-type.enum';
import { AdminCookies, UserCookies } from '../constants/cookie.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-strategy') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: AuthRequest): string | null => {
          return (
            req.cookies[UserCookies.ACCESS] ??
            req.cookies[AdminCookies.ACCESS] ??
            null
          );
        },
      ]),
      secretOrKey: configService.getOrThrow<string>('app.jwtAccessSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type === JwtSubjectType.USER) {
      const session = await this.prisma.userSession.findUnique({
        where: { sessionUuid: payload.sid },
      });

      if (!session) {
        throw new UnauthorizedException('Session not found');
      }

      if (session.revokedAt) {
        throw new UnauthorizedException('Session revoked');
      }

      if (session.expiresAt <= new Date()) {
        throw new UnauthorizedException('Session expired');
      }

      if (session.userId !== payload.sub) {
        throw new UnauthorizedException('Invalid session');
      }

      const user = await this.prisma.user.findUnique({
        where: { userId: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User inactive');
      }

      if (!user.emailVerifiedAt) {
        throw new UnauthorizedException('Email not verified');
      }

      return {
        type: JwtSubjectType.USER,
        user,
        session,
      };
    }

    if (payload.type === JwtSubjectType.ADMIN) {
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
        type: JwtSubjectType.ADMIN,
        administrator,
        session,
      };
    }

    throw new UnauthorizedException('Invalid token type');
  }
}
