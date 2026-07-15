import { Body, Controller, Ip, Post, Req } from '@nestjs/common';
import { type Request } from 'express';
import { LoginAdministratorDto } from 'src/dtos/administrator/login.administartor.dto';
import { AuthService } from 'src/services/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login') //* http://localhost:3000/auth/login
  login(
    @Body() loginAdministratorDto: LoginAdministratorDto,
    @Req() request: Request,
    @Ip() ip: string,
  ) {
    return this.authService.login(
      loginAdministratorDto,
      ip,
      request.headers['user-agent'],
    );
  }
}
