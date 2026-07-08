import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from 'src/misc/api.response.class';
import { CreateCategoryDto } from 'src/dtos/category/create.category.dto';
import { Category } from 'src/generated/prisma/client';
import { EditCategoryDto } from 'src/dtos/category/edit.category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }

  async getById(categoryId: number): Promise<Category | ApiResponse> {
    const category = await this.prisma.category.findUnique({
      where: { categoryId },
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
  }: CreateCategoryDto): Promise<Category | ApiResponse> {
    try {
      const category = await this.prisma.category.create({
        data: { name, imagePath, parentCategoryId },
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
      });
    } catch (error: any) {
      console.error(error);
      if (error?.code === 'P2002') return new ApiResponse('error', -2002);
      if (error?.code === 'P2003') return new ApiResponse('error', -2003);
      return new ApiResponse('error', -2004);
    }
  }
}
