import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotEqualTo } from 'src/common/decorators/not-equal-to.decorator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'MySecurePassword123!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  currentPassword!: string;

  @ApiProperty({
    description: 'New password',
    example: 'MyNewSecurePassword123!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @NotEqualTo('currentPassword', {
    message: 'New password must be different from current password',
  })
  newPassword!: string;
}
