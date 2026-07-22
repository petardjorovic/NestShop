import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Length, Min } from 'class-validator';

export class AddArticleFeatureDto {
  @ApiProperty({
    description: 'Feature identifier',
    example: 3,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  featureId!: number;

  @ApiProperty({
    description: 'Feature value',
    example: 'Black',
  })
  @IsString()
  @Length(1, 255)
  value!: string;
}
