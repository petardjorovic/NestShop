import { PartialType } from '@nestjs/mapped-types';
import { AddCategoryDto } from './add.category.dto';

export class EditCategoryDto extends PartialType(AddCategoryDto) {}
