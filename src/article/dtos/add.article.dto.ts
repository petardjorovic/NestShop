import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { AddArticleFeatureDto } from './add.article.feature.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AddArticleDto {
  @ApiProperty({
    description: 'Article name',
    example: 'Headphones 12R',
  })
  @IsString()
  @Length(2, 128)
  name!: string;

  @ApiProperty({
    description: 'Article excerpt',
    example: 'Short article description...',
  })
  @IsString()
  @Length(2, 255)
  excerpt!: string;

  @ApiProperty({
    description: 'Article description',
    example: 'Detailed article description...',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'Category identifier',
    example: 51,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;

  @ApiProperty({
    description: 'Current article price',
    example: 55.95,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({
    description: 'List of article features',
    isArray: true,
    type: AddArticleFeatureDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddArticleFeatureDto)
  features!: AddArticleFeatureDto[];
}
