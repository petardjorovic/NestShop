import { PartialType } from '@nestjs/mapped-types';
import { AddFeatureDto } from './add.feature.dto';

export class EditFeatureDto extends PartialType(AddFeatureDto) {}
