import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Reset password token',
    example: 's5d4d9dsds8ds69dssdDfDa5eD8Pf5g66',
  })
  @IsString()
  @MinLength(32)
  token!: string;

  @ApiProperty({
    description: 'New password',
    example: 'MyNewSecurePassword123!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}
