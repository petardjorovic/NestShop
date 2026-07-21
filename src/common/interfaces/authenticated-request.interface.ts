import { Request } from 'express';
import { Administrator } from 'src/generated/prisma/client';

export interface AuthenticatedRequest extends Request {
  user: Administrator;
}
