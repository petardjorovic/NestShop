import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowToUsers } from 'src/auth/decorators/allow-to-users.decorator';
import { JwtSubjectType } from 'src/auth/enums/jwt-subject-type.enum';
import { type UserAuthUser } from 'src/auth/interfaces/user-auth-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@AllowToUsers(JwtSubjectType.USER)
@ApiTags('User')
@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  @ApiOperation({
    summary: 'User info',
  })
  @Get('me')
  me(@CurrentUser() userData: UserAuthUser) {
    return userData.user;
  }
}
