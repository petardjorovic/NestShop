import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from 'src/auth/types/auth.user.type';
import { AuthenticatedRequest } from 'src/common/types/authenticated-request.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest<AuthUser>>();

    return request.user;
  },
);
