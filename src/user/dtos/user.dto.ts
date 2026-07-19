import { Exclude, Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  userId: number;

  @Expose()
  email: string;

  @Exclude()
  passwordHash: string;

  @Expose()
  forename: string;

  @Expose()
  surname: string;

  @Expose()
  phoneNumber: number;

  @Expose()
  postalAddress: string;
}
