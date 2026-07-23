import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AdminAuthService } from '../admin.auth.service';
import { Administrator } from 'src/generated/prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly adminAuthService: AdminAuthService) {
    super();
  }

  validate(username: string, password: string) {
    // return this.adminAuthService.validateAdministrator(username, password);
  }
}

//* IF YOU USE EMAIL INSTEAD OF USERNAME
// super({
//   usernameField: 'email',
// });
