import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserAuthService } from './user.auth.service';
import { UserPublic } from 'src/common/decorators/public-user.decorator';
import { UserRegistrationDto } from './dtos/user-registration.dto';

@ApiTags('User Authentication')
@Controller({
  path: 'auth/user',
  version: '1',
})
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @ApiOperation({
    summary: 'User registration',
  })
  @UserPublic()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() userRegistrationDto: UserRegistrationDto) {
    await this.userAuthService.register(userRegistrationDto);

    return {
      success: true,
    };
  }

  @ApiOperation({
    summary: 'Verify user email',
  })
  @UserPublic()
  @HttpCode(HttpStatus.OK)
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    await this.userAuthService.verifyEmail(token);

    return {
      success: true,
    };
  }
}
