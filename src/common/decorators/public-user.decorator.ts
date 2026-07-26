import { SetMetadata } from '@nestjs/common';

export const IS_USER_PUBLIC_KEY = 'isUserPublic';

export const UserPublic = () => SetMetadata(IS_USER_PUBLIC_KEY, true);
