import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminAuthUser } from 'src/auth/interfaces/admin-auth-user.interface';
import { AuthenticatedRequest } from 'src/common/types/authenticated-request.type';

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest<AdminAuthUser>>();

    return request.user;
  },
);
