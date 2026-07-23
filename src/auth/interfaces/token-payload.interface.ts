import { JwtSubjectType } from '../enums/jwt-subject-type.enum';

export interface JwtPayload {
  sub: number; // User ID ili Administrator ID
  sid: string; // sessionUuid
  type: JwtSubjectType;
}
