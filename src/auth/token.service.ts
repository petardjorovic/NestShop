import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/token-payload.interface';

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: StringValue;
  private readonly refreshExpiresIn: StringValue;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.getOrThrow<string>(
      'app.jwtAccessSecret',
    );
    this.refreshSecret = this.configService.getOrThrow<string>(
      'app.jwtRefreshSecret',
    );
    this.accessExpiresIn = this.configService.getOrThrow<StringValue>(
      'app.jwtAccessExpiresIn',
    );
    this.refreshExpiresIn = this.configService.getOrThrow<StringValue>(
      'app.jwtRefreshExpiresIn',
    );
  }

  async signAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn,
    });
  }

  async signRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.accessSecret,
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.refreshSecret,
    });
  }

  getAccessTokenExpiresAt(): Date {
    return new Date(Date.now() + ms(this.accessExpiresIn));
  }

  getRefreshTokenExpiresAt(): Date {
    return new Date(Date.now() + ms(this.refreshExpiresIn));
  }
}
