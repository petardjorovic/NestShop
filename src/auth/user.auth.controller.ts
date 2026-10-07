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
import { Throttle } from '@nestjs/throttler';
import { type Request, type Response } from 'express';
import { UserAuthService } from './user.auth.service';
import { CookieService } from './cookie.service';
import { Public } from 'src/common/decorators/public.decorator';
import { UserRefreshToken } from './decorators/user-refresh-token.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CsrfToken } from './decorators/csrf-token.decorator';
import { UserRegistrationDto } from './dtos/user-registration.dto';
import { ResendVerificationDto } from './dtos/resend-verification.dto';
import { UserLoginDto } from './dtos/user-login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ThrottleProfiles } from 'src/common/constants/throttle-profiles.constant';
import { type UserAuthUser } from './interfaces/user-auth-user.interface';
import { AllowToUsers } from './decorators/allow-to-users.decorator';
import { JwtSubjectType } from './enums/jwt-subject-type.enum';

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
  @Public()
  @Throttle({
    default: ThrottleProfiles.REGISTER,
  })
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
  @Public()
  @Throttle({
    default: ThrottleProfiles.USER_LOGIN,
  })
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
  @AllowToUsers(JwtSubjectType.USER)
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
  @Public()
  @Throttle({
    default: ThrottleProfiles.REFRESH,
  })
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
  @Public()
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
  @Public()
  @Throttle({
    default: ThrottleProfiles.EMAIL,
  })
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  async resendVerification(@Body() data: ResendVerificationDto) {
    await this.userAuthService.resendVerificationEmail(data.email);

    return {
      success: true,
    };
  }

  @ApiOperation({
    summary: 'Forgot password',
  })
  @Public()
  @Throttle({
    default: ThrottleProfiles.EMAIL,
  })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.userAuthService.forgotPassword(forgotPasswordDto.email);

    return {
      success: true,
    };
  }

  @ApiOperation({
    summary: 'Reset password',
  })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: ThrottleProfiles.PASSWORD_RESET,
  })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.userAuthService.resetPassword(resetPasswordDto);

    return {
      success: true,
    };
  }

  @ApiOperation({
    summary: 'Change password',
  })
  @AllowToUsers(JwtSubjectType.USER)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @CurrentUser() userData: UserAuthUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.userAuthService.changePassword(userData, changePasswordDto);

    return {
      success: true,
    };
  }

  @ApiOperation({
    summary: 'Get all user active sessions',
  })
  @AllowToUsers(JwtSubjectType.USER)
  @HttpCode(HttpStatus.OK)
  @Get('sessions')
  async getActiveSessions(@CurrentUser() userData: UserAuthUser) {
    return this.userAuthService.listActiveSessions(userData);
  }

  @ApiOperation({
    summary: 'Logout from all devices',
  })
  @AllowToUsers(JwtSubjectType.USER)
  @HttpCode(HttpStatus.OK)
  @Post('logout-all')
  async logoutAll(
    @CurrentUser() userData: UserAuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.userAuthService.logoutAll(userData.user.userId);

    this.cookieService.clearUserCookies(response);

    return {
      success: true,
    };
  }
}
