import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticted.request.interface';
import { CSRF_HEADER } from '../constants/cookie.constants';

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly csrfSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    this.csrfSecret = configService.getOrThrow<string>('app.csrfSecret');
  }

  canActivate(context: ExecutionContext): boolean {
    // @Public() overrides controller-level @AllowToUsers().
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const csrfToken = request.headers[CSRF_HEADER];

    if (!csrfToken || typeof csrfToken !== 'string') {
      throw new UnauthorizedException('CSRF token missing');
    }

    const session = request.user?.session;

    if (!session) {
      throw new UnauthorizedException();
    }

    const valid = this.verifyToken(session.csrfTokenHash, csrfToken);

    if (!valid) {
      throw new UnauthorizedException('Invalid CSRF token');
    }

    return true;
  }

  private verifyToken(csrfTokenHash: string, csrfToken: string): boolean {
    const candidateHash = createHmac('sha256', this.csrfSecret)
      .update(csrfToken)
      .digest('hex');

    const expected = Buffer.from(csrfTokenHash, 'hex');
    const actual = Buffer.from(candidateHash, 'hex');

    if (expected.length !== actual.length) {
      return false;
    }

    return timingSafeEqual(expected, actual);
  }
}
