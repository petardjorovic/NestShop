import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FeatureService } from './feature.service';
import { FeatureQueryDto } from './dtos/feature.query.dto';
import { Feature } from 'src/generated/prisma/client';
import { AddFeatureDto } from './dtos/add.feature.dto';
import { EditFeatureDto } from './dtos/edit.feature.dto';
import { JwtSubjectType } from 'src/auth/enums/jwt-subject-type.enum';
import { AllowToUsers } from 'src/auth/decorators/allow-to-users.decorator';

@Controller({
  path: 'feature',
  version: '1',
})
@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get() // GET http://localhost:3000/api/v1/feature
  getAll(@Query() query: FeatureQueryDto): Promise<Feature[]> {
    return this.featureService.getAll(query);
  }

  @Get(':id') // GET http://localhost:3000/api/v1/feature/2
  getById(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: FeatureQueryDto,
  ): Promise<Feature | null> {
    return this.featureService.getById(id, query);
  }

  @AllowToUsers(JwtSubjectType.ADMIN)
  @Post() // POST http://localhost:3000/api/v1/feature
  add(@Body() data: AddFeatureDto): Promise<Feature> {
    return this.featureService.add(data);
  }

  @AllowToUsers(JwtSubjectType.ADMIN)
  @Patch(':id') // PATCH http://localhost:3000/api/v1/feature/2
  edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: EditFeatureDto,
  ): Promise<Feature> {
    return this.featureService.edit(id, data);
  }
}
