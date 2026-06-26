import { Exclude, Expose } from 'class-transformer';

export class AdministratorDto {
  @Expose()
  administratorId: number;

  @Expose()
  username: string;

  @Exclude()
  passwordHash: string;
}
