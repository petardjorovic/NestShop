import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { Administrator } from 'src/entities/administrator.entity';
import { Serialize } from 'src/decorators/serialize.decorators';
import { AdministratorDto } from './dtos/administrator.dto';

@Serialize(AdministratorDto)
@Controller('api/administrator')
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Get()
  getAll(): Promise<Administrator[]> {
    return this.administratorService.getAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.administratorService.getById(id);
  }
}
