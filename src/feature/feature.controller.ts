import { Controller, Get, Patch, Post } from '@nestjs/common';
import { FeatureService } from './feature.service';

@Controller({
  path: 'feature',
  version: '1',
})
@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  getAll() {}

  @Get(':id')
  getById() {}

  @Post()
  add() {}

  @Patch(':id')
  edit() {}
}
