import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { Serialize } from 'src/decorators/serialize.decorators';
import { AdministratorDto } from './dtos/administrator.dto';
import { AdministratorService } from './administrator.service';
import { Administrator } from 'src/generated/prisma/client';
import { ApiResponse } from 'src/misc/api.response.class';

// @Serialize(AdministratorDto)
@Controller('api/administrator')
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Get()
  findAllAdmins(): Promise<Administrator[]> {
    return this.administratorService.findAll();
  }

  @Get(':id')
  findAdminById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Administrator | ApiResponse> {
    return this.administratorService.findById(id);
  }
}
