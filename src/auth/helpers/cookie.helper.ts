import { TokenPair } from './../interfaces/token-pair.interface';
import { Response } from 'express';

const ADMIN_REFRESH_PATH = 'admin/auth/refresh';
const USER_REFRESH_PATH = '/auth/refresh';

export function setAdminCookies(tokens: TokenPair, res: Response): Response {
  return res
    .cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    })
    .cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: ADMIN_REFRESH_PATH,
    });
}

export function clearAdminCookies(res: Response): Response {
  return res
    .clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    })
    .clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: ADMIN_REFRESH_PATH,
    });
}
