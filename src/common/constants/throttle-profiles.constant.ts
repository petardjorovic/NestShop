import { hours, minutes } from '@nestjs/throttler';

export const ThrottleProfiles = {
  USER_LOGIN: {
    ttl: minutes(15),
    limit: 5,
  },
  ADMIN_LOGIN: {
    ttl: minutes(30),
    limit: 5,
  },
  REGISTER: {
    ttl: hours(1),
    limit: 5,
  },
  EMAIL: {
    ttl: minutes(15),
    limit: 3,
  },
  REFRESH: {
    ttl: minutes(1),
    limit: 30,
  },
  PASSWORD_RESET: {
    ttl: minutes(15),
    limit: 5,
  },
  DEFAULT: {
    ttl: minutes(1),
    limit: 100,
  },
} as const;
