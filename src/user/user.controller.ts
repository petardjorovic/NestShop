import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserProtected } from 'src/auth/decorators/user-protected.decorator';
import { type UserAuthUser } from 'src/auth/interfaces/user-auth-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@UserProtected()
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
