export class UserSessionDto {
  sessionUuid!: string;
  ipAddress!: string | null;
  userAgent!: string | null;
  createdAt!: Date;
  lastUsedAt!: Date | null;
  expiresAt!: Date;
  current!: boolean;
}
