import { PartialType } from '@nestjs/mapped-types';
import { AddArticleDto } from './add.article.dto';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export enum ArticleStatus {
  Available = 'AVAILABLE',
  Visible = 'VISIBLE',
  Hidden = 'HIDDEN',
}

export class EditArticleDto extends PartialType(AddArticleDto) {
  @IsBoolean()
  @IsOptional()
  isPromoted?: boolean;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;
}
