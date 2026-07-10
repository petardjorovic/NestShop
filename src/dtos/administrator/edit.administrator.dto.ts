import { PartialType } from '@nestjs/mapped-types';
import { AddAdministratorDto } from './add.administrator.dto';

export class EditAdministratorDto extends PartialType(AddAdministratorDto) {}
