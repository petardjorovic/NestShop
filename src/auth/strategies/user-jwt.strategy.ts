import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from '../interfaces/token-payload.interface';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { UserCookies } from '../constants/cookie.constants';
import { JwtSubjectType } from '../enums/jwt-subject-type.enum';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: AuthRequest): string | null => {
          return req.cookies[UserCookies.ACCESS] ?? null;
        },
      ]),
      secretOrKey: configService.getOrThrow<string>('app.jwtAccessSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== JwtSubjectType.USER) {
      throw new UnauthorizedException('Invalid token type');
    }

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
      user,
      session,
    };
  }
}
