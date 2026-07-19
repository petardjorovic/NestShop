import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Administrator } from 'src/generated/prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  validate(username: string, password: string): Promise<Administrator> {
    return this.authService.validateAdministrator(username, password);
  }
}

//* IF YOU USE EMAIL INSTEAD OF USERNAME
// super({
//   usernameField: 'email',
// });
