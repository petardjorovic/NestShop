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

export class AddArticleDto {
  @IsString()
  @Length(2, 128)
  name: string;

  @IsString()
  @Length(2, 255)
  excerpt: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddArticleFeatureDto)
  features: AddArticleFeatureDto[];
}
