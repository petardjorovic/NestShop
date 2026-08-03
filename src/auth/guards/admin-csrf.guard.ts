import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/common/types/authenticated-request.type';
import { AdminAuthUser } from '../interfaces/admin-auth-user.interface';
import { CSRF_HEADER } from '../constants/cookie.constants';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

@Injectable()
export class AdminCsrfGuard implements CanActivate {
  private readonly csrfSecret: string;
  constructor(private readonly configService: ConfigService) {
    this.csrfSecret = configService.getOrThrow<string>('app.csrfSecret');
  }
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest<AdminAuthUser>>();

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
