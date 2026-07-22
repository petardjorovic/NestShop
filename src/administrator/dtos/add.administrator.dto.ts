import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddAdministratorDto {
  @ApiProperty({
    description: 'Administartor username',
    example: 'john123',
  })
  @IsString()
  @Length(3, 32)
  username!: string;

  @ApiProperty({
    description: 'User password',
    example: 'MySecurePassword123!',
  })
  @IsString()
  @Length(6, 100)
  password!: string;
}
