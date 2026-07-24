import { CookieService } from './cookie.service';
import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { AdminAuthService } from './admin.auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Response } from 'express';
import { AdministratorLoginDto } from './dtos/administrator-login.dto';

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
  @HttpCode(200)
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
}
