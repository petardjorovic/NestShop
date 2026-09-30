import { Injectable } from '@nestjs/common';
import { Feature } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FeatureQueryDto } from './dtos/feature.query.dto';
import { AddFeatureDto } from './dtos/add.feature.dto';
import { EditFeatureDto } from './dtos/edit.feature.dto';

@Injectable()
export class FeatureService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(query: FeatureQueryDto): Promise<Feature[]> {
    return this.prisma.feature.findMany({
      include: {
        category: query.category,
        articleFeatures: query.articleFeatures,
        ...(query.articles && {
          articleFeatures: { include: { article: true } },
        }),
      },
    });
  }

  getById(featureId: number, query: FeatureQueryDto): Promise<Feature | null> {
    return this.prisma.feature.findUnique({
      where: { featureId },
      include: {
        category: query.category,
        articleFeatures: query.articleFeatures,
        ...(query.articles && {
          articleFeatures: { include: { article: true } },
        }),
      },
    });
  }

  add(data: AddFeatureDto): Promise<Feature> {
    return this.prisma.feature.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  edit(featureId: number, data: EditFeatureDto): Promise<Feature> {
    return this.prisma.feature.update({
      where: { featureId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.categoryId && { categoryId: data.categoryId }),
      },
      include: {
        category: true,
      },
    });
  }
}
