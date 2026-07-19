import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';

export class AddCategoryDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsString()
  @Length(3, 128)
  imagePath: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentCategoryId?: number;
}
