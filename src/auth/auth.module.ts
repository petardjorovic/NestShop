import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AdministratorModule } from 'src/administrator/administrator.module';
import { AdminAuthController } from './admin.auth.controller';
import { AdminAuthService } from './admin.auth.service';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { TokenService } from './token.service';
import { UserAuthController } from './user.auth.controller';
import { UserAuthService } from './user.auth.service';
import { UserJwtStrategy } from './strategies/user-jwt.strategy';
import { CookieService } from './cookie.service';

@Module({
  imports: [
    AdministratorModule,
    PassportModule.register({}),
    JwtModule.register({}),
  ],
  controllers: [AdminAuthController, UserAuthController],
  providers: [
    AdminAuthService,
    UserAuthService,
    TokenService,
    CookieService,
    AdminJwtStrategy,
    UserJwtStrategy,
  ],
  exports: [AdminAuthService, UserAuthService, TokenService, CookieService],
})
export class AuthModule {}
