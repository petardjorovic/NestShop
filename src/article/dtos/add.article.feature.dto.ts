import { Type } from 'class-transformer';
import { IsInt, IsString, Length, Min } from 'class-validator';

export class AddArticleFeatureDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  featureId!: number;

  @IsString()
  @Length(1, 255)
  value!: string;
}
