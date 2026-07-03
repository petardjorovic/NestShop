import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { Serialize } from 'src/decorators/serialize.decorators';
import { AdministratorDto } from './dtos/administrator.dto';
import { AdministratorService } from './administrator.service';
import { Administrator } from 'src/generated/prisma/client';
import { ApiResponse } from 'src/misc/api.response.class';
import { CreateAdministratorDto } from './dtos/create-administrator.dto';
import { EditAdministratorDto } from './dtos/edit-administrator.dto';

// @Serialize(AdministratorDto)
@Controller('api/administrator')
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Get()
  getAll(): Promise<Administrator[]> {
    return this.administratorService.findAll();
  }

  @Get(':id')
  getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Administrator | ApiResponse> {
    return this.administratorService.findById(id);
  }

  @Post()
  add(
    @Body() createAdministratorDto: CreateAdministratorDto,
  ): Promise<Administrator | ApiResponse> {
    return this.administratorService.addAdministrator(createAdministratorDto);
  }

  @Patch(':id')
  edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() editAdministratorDto: EditAdministratorDto,
  ): Promise<Administrator | ApiResponse> {
    return this.administratorService.editAdministrator(
      id,
      editAdministratorDto,
    );
  }
}
