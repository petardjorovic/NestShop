import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';

export class AddCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Laptops',
  })
  @IsString()
  @Length(2, 50)
  name!: string;

  @ApiProperty({
    description: 'Relative path of the image',
    example: './uploads/exmaple-image.jpg',
  })
  @IsString()
  @Length(3, 128)
  imagePath!: string;

  @ApiPropertyOptional({
    description: 'Parent category identifier',
    example: 23,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentCategoryId?: number;
}
