import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { booleanTransform } from 'src/common/transforms/boolean.transform';

export class CategoryQueryDto {
  @ApiPropertyOptional({
    description: 'Include category subcategories',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransform)
  subcategories?: boolean = true;

  @ApiPropertyOptional({
    description: 'Include category features',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransform)
  features?: boolean = true;

  @ApiPropertyOptional({
    description: 'Include category parent category',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransform)
  parentCategory?: boolean;

  @ApiPropertyOptional({
    description: 'Include articles containing this category',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransform)
  articles?: boolean;
}
