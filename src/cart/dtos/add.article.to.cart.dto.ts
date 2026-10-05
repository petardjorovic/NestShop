import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class AddArticleToCartDto {
  @ApiProperty({
    description: 'Article identifier',
    example: 1256,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  articleId!: number;

  @ApiProperty({
    description: 'Article quantity',
    example: 2,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}
