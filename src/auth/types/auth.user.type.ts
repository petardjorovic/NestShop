import { UserAuthUser } from '../interfaces/user-auth-user.interface';
import { AdminAuthUser } from '../interfaces/admin-auth-user.interface';

export type AuthUser = UserAuthUser | AdminAuthUser;
