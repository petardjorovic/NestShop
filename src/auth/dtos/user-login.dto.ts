import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({
    description: 'User email',
    example: 'john123@email.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'MySecurePassword123!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}
