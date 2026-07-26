import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../interfaces/auth-request.interface';

export const Cookie = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    return data ? request.cookies[data] : request.cookies;
  },
);
