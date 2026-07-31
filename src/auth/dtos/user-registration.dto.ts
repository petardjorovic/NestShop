import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserRegistrationDto {
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

  @ApiProperty({
    description: 'User forename',
    example: 'John',
  })
  @IsString()
  @Length(2, 64)
  forename!: string;

  @ApiProperty({
    description: 'User surname',
    example: 'Johnson',
  })
  @IsString()
  @Length(2, 64)
  surname!: string;

  @ApiProperty({
    description: 'User phone number',
    example: '556956945',
  })
  @IsString()
  @Length(9, 24)
  phoneNumber!: string;

  @ApiProperty({
    description: 'User postal address',
    example: '123 Main Street. San Diego, CA 92111. USA.',
  })
  @IsString()
  @Length(5, 255)
  postalAddress!: string;
}
