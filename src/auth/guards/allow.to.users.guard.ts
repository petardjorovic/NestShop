import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { ALLOWED_USERS_KEY } from '../decorators/allow-to-users.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticted.request.interface';
import { JwtSubjectType } from '../enums/jwt-subject-type.enum';

@Injectable()
export class AllowToUsersGuard extends AuthGuard('jwt-strategy') {
  constructor(private readonly reflector: Reflector) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    // @Public() always has priority over @AllowToUsers().
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Read allowed user types from the method first, then the controller.
    // Method-level metadata overrides controller-level metadata.
    const allowedUsers = this.reflector.getAllAndOverride<JwtSubjectType[]>(
      ALLOWED_USERS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!allowedUsers) {
      return true;
    }

    // Authenticate the request using the unified JWT strategy.
    // If authentication fails, AuthGuard throws UnauthorizedException (401).
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Authentication succeeded, but the authenticated user type
    // must be one of the types allowed by @AllowToUsers().
    if (!allowedUsers.includes(request.user.type)) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
