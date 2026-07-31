import { VerificationType } from 'src/generated/prisma/enums';

export interface CreateUserWithVerificationTokenData {
  email: string;
  passwordHash: string;
  forename: string;
  surname: string;
  phoneNumber: string;
  postalAddress: string;
  expiresInHours: number;
  verificationType: VerificationType;
}
