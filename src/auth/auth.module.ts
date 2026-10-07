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
import { JwtStrategy } from './strategies/jwt.strategy';
import { AllowToUsersGuard } from './guards/allow.to.users.guard';
import { CsrfGuard } from './guards/csrf.guard';

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
    JwtStrategy,
    AllowToUsersGuard,
    CsrfGuard,
  ],
  exports: [
    AdminAuthService,
    UserAuthService,
    TokenService,
    CookieService,
    AllowToUsersGuard,
    CsrfGuard,
  ],
})
export class AuthModule {}
