import { Request } from 'express';

export type AuthenticatedRequest<TUser> = Request & {
  user: TUser;
};
