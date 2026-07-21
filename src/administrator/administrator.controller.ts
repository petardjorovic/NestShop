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
import { ApiResponse } from 'src/common/responses/api.response.class';
import { AddAdministratorDto } from './dtos/add.administrator.dto';
import { EditAdministratorDto } from './dtos/edit.administrator.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
// import { Serialize } from 'src/decorators/serialize.decorators';
// import { AdministratorDto } from './dtos/administrator.dto';

// @Serialize(AdministratorDto)
@ApiBearerAuth('access-token')
@Controller({
  path: 'administrator',
  version: '1',
})
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  // GET http://localhost:3000/api/administrator
  @Get()
  getAll(): Promise<Administrator[]> {
    return this.administratorService.findAll();
  }

  // GET http://localhost:3000/api/administrator/1
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Administrator | ApiResponse> {
    const admin = await this.administratorService.findById(id);

    if (!admin) {
      return new ApiResponse('error', -1001);
    }

    return admin;
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
