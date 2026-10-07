import { User, UserSession } from 'src/generated/prisma/client';
import { JwtSubjectType } from '../enums/jwt-subject-type.enum';

export interface UserAuthUser {
  type: JwtSubjectType.USER;
  user: User;
  session: UserSession;
}
