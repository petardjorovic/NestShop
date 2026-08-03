import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({
    description: 'User email',
    example: 'john123@email.com',
  })
  @IsEmail()
  email!: string;
}
