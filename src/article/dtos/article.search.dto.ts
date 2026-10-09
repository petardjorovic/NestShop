import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { ArticleSearchFeatureComponentDto } from './article.search.feature.component.dto';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ArticleSearchDto {
  @ApiPropertyOptional({
    description: 'Category identifier',
    example: 56,
  })
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @IsPositive()
  @Type(() => Number)
  categoryId!: number;

  @ApiPropertyOptional({
    description: 'Search term',
    example: 'Modern',
  })
  @IsOptional()
  @IsString()
  @Length(2, 128)
  keywords?: string;

  @ApiPropertyOptional({
    description: 'Price Minimum',
    example: 12.5,
  })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  priceMin?: number;

  @ApiPropertyOptional({
    description: 'Price maximum',
    example: 125.0,
  })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  priceMax?: number;

  @ApiPropertyOptional({
    description: 'Article features',
    example: [{ featureId: 1, values: ['Apple', 'Samsung'] }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticleSearchFeatureComponentDto)
  features?: ArticleSearchFeatureComponentDto[];

  @ApiPropertyOptional({
    description: 'Order by name or price',
    example: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'price'])
  orderBy?: 'name' | 'price' = 'name';

  @ApiPropertyOptional({
    description: 'Direction of order',
    example: 'ASC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC' = 'ASC';

  @ApiPropertyOptional({
    description: 'Page number',
    example: 2,
  })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @IsPositive()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @IsIn([5, 10, 25, 50, 75])
  @Type(() => Number)
  itemsPerPage?: 5 | 10 | 25 | 50 | 75 = 10;
}
