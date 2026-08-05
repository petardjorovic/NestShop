import { CookieService } from './cookie.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Request, type Response } from 'express';
import { AdminAuthService } from './admin.auth.service';
import { AdminPublic } from 'src/common/decorators/public-admin.decorator';
import { CurrentAdmin } from 'src/common/decorators/current-admin.decorator';
import { AdminProtected } from './decorators/admin-protected.decorator';
import { AdminRefreshToken } from './decorators/admin-refresh-token.decorator';
import { CsrfToken } from './decorators/csrf-token.decorator';
import { AdministratorLoginDto } from './dtos/administrator-login.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AdministratorSessionDto } from './dtos/administrator-session.dto';
import { type AdminAuthUser } from './interfaces/admin-auth-user.interface';

@ApiTags('Administrator Authentication')
@Controller({
  path: 'auth/admin',
  version: '1',
})
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly cookieService: CookieService,
  ) {}

  @ApiOperation({
    summary: 'Administrator login',
  })
  @AdminPublic()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginAdministratorDto: AdministratorLoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.adminAuthService.login(
      loginAdministratorDto,
      request.ip,
      request.headers['user-agent'],
    );

    this.cookieService.setAdminCookies(tokens, response);

    return {
      success: true,
    };
  }

  @ApiOperation({
    summary: 'Refresh administrator tokens',
  })
  @AdminPublic()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @AdminRefreshToken() refreshToken: string,
    @CsrfToken() csrfToken: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const tokens = await this.adminAuthService.refresh(
        refreshToken,
        csrfToken,
        request.ip,
        request.headers['user-agent'],
      );

      this.cookieService.setAdminCookies(tokens, response);

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.cookieService.clearAdminCookies(response);
      }

      throw error;
    }
  }

  @ApiOperation({
    summary: 'Administrator logout',
  })
  @AdminProtected()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CurrentAdmin() admin: AdminAuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.adminAuthService.logout(admin.session.sessionUuid);

    this.cookieService.clearAdminCookies(response);

    return {
      success: true,
    };
  }

  @ApiOperation({
    summary: 'Logout from all devices',
  })
  @AdminProtected()
  @HttpCode(HttpStatus.OK)
  @Post('logout-all')
  async logoutAll(
    @CurrentAdmin() adminData: AdminAuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.adminAuthService.logoutAll(
      adminData.administrator.administratorId,
    );

    this.cookieService.clearAdminCookies(response);

    return {
      success: true,
    };
  }

  @ApiOperation({
    summary: 'Change password',
  })
  @AdminProtected()
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @CurrentAdmin() adminData: AdminAuthUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.adminAuthService.changePassword(adminData, changePasswordDto);

    return {
      success: true,
    };
  }

  @ApiOperation({
    summary: 'Get all administrator active sessions',
  })
  @AdminProtected()
  @HttpCode(HttpStatus.OK)
  @Get('sessions')
  getActiveSessions(
    @CurrentAdmin() adminData: AdminAuthUser,
  ): Promise<AdministratorSessionDto[]> {
    return this.adminAuthService.listActiveSessions(adminData);
  }
}
