import { Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { type AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  login(@Request() req: AuthenticatedRequest) {
    return this.authService.login(req.user);
  }
}
