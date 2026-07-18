import { Module } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { AdministratorController } from './administrator.controller';

@Module({
  providers: [AdministratorService],
  controllers: [AdministratorController],
  exports: [AdministratorService],
})
export class AdministratorModule {}
