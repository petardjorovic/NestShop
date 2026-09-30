import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Length, Min } from 'class-validator';

export class AddFeatureDto {
  @ApiProperty({
    description: 'Feature name',
    example: 'Width',
  })
  @IsString()
  @Length(2, 32)
  name!: string;

  @ApiProperty({
    description: 'Category identifier',
    example: 51,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;
}
