import { Controller, Get } from '@nestjs/common';

import { Serialize } from 'src/decorators/serialize.decorators';
import { AdministratorDto } from './dtos/administrator.dto';
import { AdministratorService } from './administrator.service';
import { User } from 'src/generated/prisma/client';

@Serialize(AdministratorDto)
@Controller('api/administrator')
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.administratorService.findAll();
  }
}
