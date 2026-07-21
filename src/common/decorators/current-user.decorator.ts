import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Administrator } from '../../generated/prisma/client';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof Administrator | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (data) {
      return request.user[data];
    }

    return request.user;
  },
);
