import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateCategoryDto } from 'src/dtos/category/create.category.dto';
import { EditCategoryDto } from 'src/dtos/category/edit.category.dto';
import { Category } from 'src/generated/prisma/client';
import { ApiResponse } from 'src/misc/api.response.class';
import { CategoryService } from 'src/services/category/category.service';

@Controller('api/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  getAll(): Promise<Category[]> {
    return this.categoryService.getAll();
  }

  @Get(':id')
  getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Category | ApiResponse> {
    return this.categoryService.getById(id);
  }

  @Post()
  add(
    @Body() createCategoryDto: CreateCategoryDto,
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
