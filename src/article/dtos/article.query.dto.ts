import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { booleanTransform } from 'src/common/transforms/boolean.transform';

export class ArticleQueryDto {
  @ApiPropertyOptional({
    description: 'Include article category',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransform)
  category?: boolean;

  @ApiPropertyOptional({
    description: 'Include article photos',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransform)
  photos?: boolean;

  @ApiPropertyOptional({
    description: 'Include article price history',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransform)
  articlePrices?: boolean;

  @ApiPropertyOptional({
    description: 'Include article features',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransform)
  articleFeatures?: boolean;

  @ApiPropertyOptional({
    description: 'Include carts containing this article',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransform)
  carts?: boolean;
}
