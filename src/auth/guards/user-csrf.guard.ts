import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthenticatedRequest } from 'src/common/types/authenticated-request.type';
import { CSRF_HEADER } from '../constants/cookie.constants';
import { UserAuthUser } from '../interfaces/user-auth-user.interface';

@Injectable()
export class UserCsrfGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest<UserAuthUser>>();

    const csrfToken = request.headers[CSRF_HEADER];

    if (!csrfToken || typeof csrfToken !== 'string') {
      throw new UnauthorizedException('CSRF token missing');
    }

    const session = request.user?.session;

    if (!session) {
      throw new UnauthorizedException();
    }

    const valid = await argon2.verify(session.csrfTokenHash, csrfToken);

    if (!valid) {
      throw new UnauthorizedException('Invalid CSRF token');
    }

    return true;
  }
}
