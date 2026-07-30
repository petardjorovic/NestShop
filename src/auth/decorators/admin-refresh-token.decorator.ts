import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { AdminCookies } from '../constants/cookie.constants';

export const AdminRefreshToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    const refreshToken = request.cookies[AdminCookies.REFRESH];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    return refreshToken;
  },
);
