export const AdminCookies = {
  ACCESS: 'admin_access',
  REFRESH: 'admin_refresh',
  CSRF: 'admin_csrf',
} as const;

export const UserCookies = {
  ACCESS: 'user_access',
  REFRESH: 'user_refresh',
  CSRF: 'user_csrf',
} as const;

export const ADMIN_REFRESH_PATH = '/api/v1/auth/admin/refresh';
export const USER_REFRESH_PATH = '/api/v1/auth/refresh';
