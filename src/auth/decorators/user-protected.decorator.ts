import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserJwtGuard } from '../guards/user-jwt.guard';
import { UserCsrfGuard } from '../guards/user-csrf.guard';

export function UserProtected() {
  return applyDecorators(
    UseGuards(UserJwtGuard, UserCsrfGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
