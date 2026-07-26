import {
  Administrator,
  AdministratorSession,
} from 'src/generated/prisma/client';

export interface AdminAuthUser {
  administrator: Administrator;
  session: AdministratorSession;
}
