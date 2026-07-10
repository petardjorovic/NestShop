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
import { CategoryQueryDto } from 'src/dtos/category/category.query.dto';
import { AddCategoryDto } from 'src/dtos/category/add.category.dto';
import { EditCategoryDto } from 'src/dtos/category/edit.category.dto';
import { Category } from 'src/generated/prisma/client';
import { ApiResponse } from 'src/misc/api.response.class';
import { CategoryService } from 'src/services/category/category.service';

@Controller('api/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  getAll(@Query() query: CategoryQueryDto): Promise<Category[]> {
    return this.categoryService.getAll(query);
  }

  @Get(':id')
  getById(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: CategoryQueryDto,
  ): Promise<Category | ApiResponse> {
    return this.categoryService.getById(id, query);
  }

  @Post()
  add(
    @Body() createCategoryDto: AddCategoryDto,
  ): Promise<Category | ApiResponse> {
    return this.categoryService.add(createCategoryDto);
  }

  @Patch(':id')
  edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() editCategoryDto: EditCategoryDto,
  ): Promise<Category | ApiResponse> {
    return this.categoryService.edit(id, editCategoryDto);
  }
}
