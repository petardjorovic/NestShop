import { PartialType } from '@nestjs/mapped-types';
import { AddArticleDto } from './add.article.dto';

export class EditArticleDto extends PartialType(AddArticleDto) {}
