import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { booleanTransform } from 'src/common/transforms/boolean.transform';

export class FeatureQueryDto {
  @ApiPropertyOptional({
    description: 'Include category',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransform)
  category?: boolean = true;

  @ApiPropertyOptional({
    description: 'Include article-features',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransform)
  articleFeatures?: boolean;

  @ApiPropertyOptional({
    description: 'Include articles',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransform)
  articles?: boolean;
}
