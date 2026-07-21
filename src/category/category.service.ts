import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/responses/api.response.class';
import { AddCategoryDto } from 'src/category/dtos/add.category.dto';
import { Category } from 'src/generated/prisma/client';
import { EditCategoryDto } from 'src/category/dtos/edit.category.dto';
import { CategoryQueryDto } from 'src/category/dtos/category.query.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(query: CategoryQueryDto): Promise<Category[]> {
    return this.prisma.category.findMany({
      include: {
        subcategories: query.subcategories,
        features: query.features,
        parentCategory: query.parentCategory,
        articles: query.articles,
      },
    });
  }

  async getById(
    categoryId: number,
    query: CategoryQueryDto,
  ): Promise<Category | ApiResponse> {
    const category = await this.prisma.category.findUnique({
      where: { categoryId },
      include: {
        subcategories: query.subcategories,
        features: query.features,
        parentCategory: query.parentCategory,
        articles: query.articles,
      },
    });

    if (!category) {
      return new ApiResponse('error', -2001);
    }

    return category;
  }

  async add({
    name,
    imagePath,
    parentCategoryId,
  }: AddCategoryDto): Promise<Category | ApiResponse> {
    try {
      const category = await this.prisma.category.create({
        data: { name, imagePath, parentCategoryId },
        include: { subcategories: true, features: true },
      });

      return category;
    } catch (error: any) {
      console.error(error);
      if (error?.code === 'P2002') return new ApiResponse('error', -2002);
      if (error?.code === 'P2003') return new ApiResponse('error', -2003);
      return new ApiResponse('error', -2004);
    }
  }

  async edit(
    categoryId: number,
    data: EditCategoryDto,
  ): Promise<Category | ApiResponse> {
    try {
      return await this.prisma.category.update({
        where: { categoryId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.imagePath !== undefined && { imagePath: data.imagePath }),
          ...(data.parentCategoryId !== undefined && {
            parentCategoryId: data.parentCategoryId,
          }),
        },
        include: { subcategories: true, features: true },
      });
    } catch (error: any) {
      console.error(error);
      if (error?.code === 'P2002') return new ApiResponse('error', -2002);
      if (error?.code === 'P2003') return new ApiResponse('error', -2003);
      return new ApiResponse('error', -2004);
    }
  }
}
