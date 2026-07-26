import { User, UserSession } from 'src/generated/prisma/client';

export interface UserAuthUser {
  user: User;
  session: UserSession;
}
