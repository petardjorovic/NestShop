import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdministratorService } from 'src/administrator/administrator.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly administratorService: AdministratorService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('app.jwtAccessSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    const administrator = await this.administratorService.findById(payload.sub);

    if (!administrator) {
      throw new UnauthorizedException();
    }

    return administrator;
  }
}
