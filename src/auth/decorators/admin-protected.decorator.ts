import { applyDecorators, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { AdminCsrfGuard } from '../guards/admin-csrf.guard';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';

export function AdminProtected() {
  return applyDecorators(
    UseGuards(AdminJwtGuard, AdminCsrfGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
