import { CookieService } from './cookie.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthService } from './admin.auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Response } from 'express';
import { AdministratorLoginDto } from './dtos/administrator-login.dto';
import { type AuthRequest } from './interfaces/auth-request.interface';
import { AdminCookies, CSRF_HEADER } from './constants/cookie.constants';
import { AdminPublic } from 'src/common/decorators/public-admin.decorator';
import { CurrentAdmin } from 'src/common/decorators/current-admin.decorator';
import { type AdminAuthUser } from './interfaces/admin-auth-user.interface';
import { AdminJwtGuard } from './guards/admin-jwt.guard';

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
  @HttpCode(HttpStatus.OK)
  @AdminPublic()
  @Post('login')
  async login(
    @Body() loginAdministratorDto: AdministratorLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.adminAuthService.login(loginAdministratorDto);

    this.cookieService.setAdminCookies(tokens, response);

    return {
      success: true,
    };
  }

  @ApiOperation({
    summary: 'Refresh administrator tokens',
  })
  @HttpCode(HttpStatus.OK)
  @AdminPublic()
  @Post('refresh')
  async refresh(
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies[AdminCookies.REFRESH];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    const csrfToken = request.headers[CSRF_HEADER];

    if (!csrfToken || typeof csrfToken !== 'string') {
      throw new UnauthorizedException('CSRF token missing');
    }

    const tokens = await this.adminAuthService.refresh(refreshToken, csrfToken);

    this.cookieService.setAdminCookies(tokens, response);

    return {
      success: true,
    };
  }

  @UseGuards(AdminJwtGuard)
  @ApiOperation({
    summary: 'Administrator logout',
  })
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
}
