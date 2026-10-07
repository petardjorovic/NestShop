import {
  Administrator,
  AdministratorSession,
} from 'src/generated/prisma/client';
import { JwtSubjectType } from '../enums/jwt-subject-type.enum';

export interface AdminAuthUser {
  type: JwtSubjectType.ADMIN;
  administrator: Administrator;
  session: AdministratorSession;
}
