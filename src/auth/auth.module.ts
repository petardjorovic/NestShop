import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AdministratorModule } from 'src/administrator/administrator.module';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { VerificationTokenModule } from 'src/verification-token/verification-token.module';
import { AdminAuthController } from './admin.auth.controller';
import { UserAuthController } from './user.auth.controller';
import { AdminAuthService } from './admin.auth.service';
import { UserAuthService } from './user.auth.service';
import { TokenService } from './token.service';
import { CookieService } from './cookie.service';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { UserJwtStrategy } from './strategies/user-jwt.strategy';
import { AdminCsrfGuard } from './guards/admin-csrf.guard';
import { UserCsrfGuard } from './guards/user-csrf.guard';

@Module({
  imports: [
    AdministratorModule,
    UserModule,
    VerificationTokenModule,
    MailModule,
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
    AdminCsrfGuard,
    UserCsrfGuard,
  ],
  exports: [
    AdminAuthService,
    UserAuthService,
    TokenService,
    CookieService,
    AdminCsrfGuard,
    UserCsrfGuard,
  ],
})
export class AuthModule {}
