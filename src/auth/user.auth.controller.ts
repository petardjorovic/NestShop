import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserAuthService } from './user.auth.service';
import { UserPublic } from 'src/common/decorators/public-user.decorator';
import { UserRegistrationDto } from './dtos/user-registration.dto';
import { ResendVerificationDto } from './dtos/resend-verification.dto';
import { UserLoginDto } from './dtos/user-login.dto';
import { type Request, type Response } from 'express';
import { CookieService } from './cookie.service';
import { UserRefreshToken } from './decorators/user-refresh-token.decorator';
import { CsrfToken } from './decorators/csrf-token.decorator';
import { UserProtected } from './decorators/user-protected.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type UserAuthUser } from './interfaces/user-auth-user.interface';

@ApiTags('User Authentication')
@Controller({
  path: 'auth/user',
  version: '1',
})
export class UserAuthController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly cookieService: CookieService,
  ) {}

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
    summary: 'User login',
  })
  @UserPublic()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() data: UserLoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.userAuthService.login(
      data,
      request.ip,
      request.headers['user-agent'],
    );

    this.cookieService.setUserCookies(tokens, response);

    return {
      success: true,
    };
  }

  @ApiOperation({
    summary: 'User logout',
  })
  @UserProtected()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CurrentUser() user: UserAuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.userAuthService.logout(user.session.sessionUuid);

    this.cookieService.clearUserCookies(response);

    return {
      success: true,
    };
  }

  @ApiOperation({
    summary: 'Refresh user tokens',
  })
  @UserPublic()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @UserRefreshToken() refreshToken: string,
    @CsrfToken() csrfToken: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const tokens = await this.userAuthService.refresh(
        refreshToken,
        csrfToken,
        request.ip,
        request.headers['user-agent'],
      );

      this.cookieService.setUserCookies(tokens, response);

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.cookieService.clearUserCookies(response);
      }

      throw error;
    }
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

  @ApiOperation({
    summary: 'Resend verification email',
  })
  @UserPublic()
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  async resendVerification(@Body() data: ResendVerificationDto) {
    await this.userAuthService.resendVerificationEmail(data.email);

    return {
      success: true,
    };
  }
}
