import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import { AdminCookies, UserCookies } from './constants/cookie.constants';
import { TokenService } from './token.service';
import { Tokens } from './interfaces/tokens.interface';
import {
  ADMIN_REFRESH_PATH,
  USER_REFRESH_PATH,
} from './constants/cookie.constants';
import { Environment } from './enums/environment.enum';

@Injectable()
export class CookieService {
  private readonly secure: CookieOptions['secure'];
  private readonly sameSite: CookieOptions['sameSite'] = 'lax';

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    this.secure =
      this.configService.getOrThrow<Environment>('app.environment') ===
      Environment.Production;
  }

  setAdminCookies(tokens: Tokens, res: Response): Response {
    return res
      .cookie(AdminCookies.ACCESS, tokens.accessToken, {
        ...this.getHttpOnlyOptions(),
        expires: this.tokenService.getAccessTokenExpiresAt(),
      })
      .cookie(AdminCookies.REFRESH, tokens.refreshToken, {
        ...this.getHttpOnlyOptions(),
        expires: this.tokenService.getRefreshTokenExpiresAt(),
        path: ADMIN_REFRESH_PATH,
      })
      .cookie(AdminCookies.CSRF, tokens.csrfToken, {
        ...this.getCsrfOptions(),
        expires: this.tokenService.getRefreshTokenExpiresAt(),
      });
  }

  clearAdminCookies(res: Response): Response {
    return res
      .clearCookie(AdminCookies.ACCESS, {
        ...this.getHttpOnlyOptions(),
      })
      .clearCookie(AdminCookies.REFRESH, {
        ...this.getHttpOnlyOptions(),
        path: ADMIN_REFRESH_PATH,
      })
      .clearCookie(AdminCookies.CSRF, {
        ...this.getCsrfOptions(),
      });
  }

  setUserCookies(tokens: Tokens, res: Response): Response {
    return res
      .cookie(UserCookies.ACCESS, tokens.accessToken, {
        ...this.getHttpOnlyOptions(),
        expires: this.tokenService.getAccessTokenExpiresAt(),
      })
      .cookie(UserCookies.REFRESH, tokens.refreshToken, {
        ...this.getHttpOnlyOptions(),
        expires: this.tokenService.getRefreshTokenExpiresAt(),
        path: USER_REFRESH_PATH,
      })
      .cookie(UserCookies.CSRF, tokens.csrfToken, {
        ...this.getCsrfOptions(),
        expires: this.tokenService.getRefreshTokenExpiresAt(),
      });
  }

  clearUserCookies(res: Response): Response {
    return res
      .clearCookie(UserCookies.ACCESS, {
        ...this.getHttpOnlyOptions(),
      })
      .clearCookie(UserCookies.REFRESH, {
        ...this.getHttpOnlyOptions(),
        path: USER_REFRESH_PATH,
      })
      .clearCookie(UserCookies.CSRF, {
        ...this.getCsrfOptions(),
      });
  }

  private getHttpOnlyOptions(): CookieOptions {
    return {
      secure: this.secure,
      sameSite: this.sameSite,
      httpOnly: true,
    };
  }

  private getCsrfOptions(): CookieOptions {
    return {
      secure: this.secure,
      sameSite: this.sameSite,
      httpOnly: false,
      path: '/',
    };
  }
}
