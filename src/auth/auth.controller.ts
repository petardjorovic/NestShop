import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginAdministratorDto } from 'src/administrator/dtos/login.administartor.dto';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Administrator login',
  })
  @Public()
  @HttpCode(200)
  @Post('login')
  login(@Body() loginAdministartorDto: LoginAdministratorDto) {
    return this.authService.login(loginAdministartorDto);
  }
}
