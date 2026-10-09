import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class ArticleSearchFeatureComponentDto {
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @IsPositive()
  @Type(() => Number)
  featureId!: number;

  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @Length(1, 255, { each: true })
  values!: string[];
}
