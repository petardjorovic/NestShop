import { IsString, Length } from 'class-validator';

export class AddAdministratorDto {
  @IsString()
  @Length(3, 32)
  username: string;

  @IsString()
  @Length(6, 100)
  password: string;
}
