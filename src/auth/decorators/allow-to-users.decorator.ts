import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtSubjectType } from '../enums/jwt-subject-type.enum';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AllowToUsersGuard } from '../guards/allow.to.users.guard';
import { CsrfGuard } from '../guards/csrf.guard';

export const ALLOWED_USERS_KEY = 'allowedUsers';

export function AllowToUsers(...allowedUsers: JwtSubjectType[]) {
  return applyDecorators(
    SetMetadata(ALLOWED_USERS_KEY, allowedUsers),
    UseGuards(AllowToUsersGuard, CsrfGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
