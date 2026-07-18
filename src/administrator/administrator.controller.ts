import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { Administrator } from 'src/generated/prisma/client';
import { ApiResponse } from 'src/misc/api.response.class';
import { AddAdministratorDto } from 'src/dtos/administrator/add.administrator.dto';
import { EditAdministratorDto } from 'src/dtos/administrator/edit.administrator.dto';

// import { Serialize } from 'src/decorators/serialize.decorators';
// import { AdministratorDto } from './dtos/administrator.dto';

// @Serialize(AdministratorDto)
@Controller('api/administrator')
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  // GET http://localhost:3000/api/administrator
  @Get()
  getAll(): Promise<Administrator[]> {
    return this.administratorService.findAll();
  }

  // GET http://localhost:3000/api/administrator/1
  @Get(':id')
  getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Administrator | ApiResponse> {
    return this.administratorService.findById(id);
  }

  // POST http://localhost:3000/api/administrator
  @Post()
  add(
    @Body() createAdministratorDto: AddAdministratorDto,
  ): Promise<Administrator | ApiResponse> {
    return this.administratorService.addAdministrator(createAdministratorDto);
  }

  // PATCH http://localhost:3000/api/administrator/4
  @Patch(':id')
  edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() editAdministratorDto: EditAdministratorDto,
  ): Promise<Administrator | ApiResponse> {
    return this.administratorService.editById(id, editAdministratorDto);
  }
}
