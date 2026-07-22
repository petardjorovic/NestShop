import { PartialType } from '@nestjs/mapped-types';
import { AddArticleDto } from './add.article.dto';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ArticleStatus {
  AVAILABLE = 'AVAILABLE',
  VISIBLE = 'VISIBLE',
  HIDDEN = 'HIDDEN',
}

export class EditArticleDto extends PartialType(AddArticleDto) {
  @ApiPropertyOptional({
    description: 'Whether the article is promoted',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPromoted?: boolean;

  @ApiPropertyOptional({
    description: 'Current article status',
    enum: ArticleStatus,
    example: ArticleStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;
}
