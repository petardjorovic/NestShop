import { PartialType } from '@nestjs/mapped-types';
import { CreateAdministratorDto } from './create.administrator.dto';

export class EditAdministratorDto extends PartialType(CreateAdministratorDto) {}
