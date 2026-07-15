import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Article, Prisma } from 'src/generated/prisma/client';
import { ApiResponse } from 'src/misc/api.response.class';
import { ArticleQueryDto } from 'src/dtos/article/article.query.dto';
import { AddArticleDto } from 'src/dtos/article/add.article.dto';
import { EditArticleDto } from 'src/dtos/article/edit.article.dto';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(query: ArticleQueryDto): Promise<Article[]> {
    return this.prisma.article.findMany({
      include: {
        category: query.category,
        photos: query.photos,
        ...(query.articlePrices && {
          articlePrices: {
            orderBy: [{ createdAt: 'desc' }, { articlePriceId: 'desc' }],
            take: 1,
          },
        }),
        ...(query.articleFeatures && {
          articleFeatures: { include: { feature: true } },
        }),
      },
    });
  }

  async getById(articleId: number): Promise<Article | ApiResponse> {
    const article = await this.prisma.article.findUnique({
      where: { articleId },
      include: {
        category: true,
        photos: true,
        articlePrices: {
          orderBy: [{ createdAt: 'desc' }, { articlePriceId: 'desc' }],
          take: 1,
        },
        articleFeatures: { include: { feature: true } },
      },
    });

    if (!article) {
      return new ApiResponse('error', -4001);
    }

    return article;
  }

  async add(data: AddArticleDto): Promise<Article | ApiResponse> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const newArticle = await tx.article.create({
          data: {
            name: data.name,
            excerpt: data.excerpt,
            description: data.description,
            categoryId: data.categoryId,
          },
        });

        await tx.articlePrice.create({
          data: {
            articleId: newArticle.articleId,
            price: data.price,
          },
        });

        await tx.articleFeature.createMany({
          data: data.features.map((feature) => ({
            articleId: newArticle.articleId,
            featureId: feature.featureId,
            value: feature.value,
          })),
        });

        const existingArticle = await tx.article.findUnique({
          where: { articleId: newArticle.articleId },
          include: {
            category: true,
            articlePrices: {
              orderBy: [{ createdAt: 'desc' }, { articlePriceId: 'desc' }],
              take: 1,
            },
            articleFeatures: { include: { feature: true } },
            photos: true,
          },
        });

        return existingArticle!;
      });
    } catch (error) {
      console.error(error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            return new ApiResponse('error', -4001);
          case 'P2003':
            return new ApiResponse('error', -4002);
          case 'P2025':
            return new ApiResponse('error', -4003);
        }
      }
      return new ApiResponse('error', -4010);
    }
  }

  async edit(
    articleId: number,
    data: EditArticleDto,
  ): Promise<Article | ApiResponse> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.article.update({
          where: { articleId },
          data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
            ...(data.description !== undefined && {
              description: data.description,
            }),
            ...(data.categoryId !== undefined && {
              categoryId: data.categoryId,
            }),
            ...(data.isPromoted !== undefined && {
              isPromoted: data.isPromoted,
            }),
            ...(data.status !== undefined && { status: data.status }),
          },
        });

        if (data.price !== undefined) {
          await tx.articlePrice.create({
            data: {
              articleId,
              price: data.price,
            },
          });
        }

        if (data.features !== undefined) {
          await tx.articleFeature.deleteMany({ where: { articleId } });

          if (data.features.length > 0) {
            await tx.articleFeature.createMany({
              data: data.features.map((feature) => ({
                articleId,
                featureId: feature.featureId,
                value: feature.value,
              })),
            });
          }
        }

        const article = await tx.article.findUnique({
          where: { articleId },
          include: {
            category: true,
            articlePrices: {
              orderBy: [{ createdAt: 'desc' }, { articlePriceId: 'desc' }],
              take: 1,
            },
            articleFeatures: {
              include: { feature: true },
            },
            photos: true,
          },
        });

        return article!;
      });
    } catch (error) {
      console.error(error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            return new ApiResponse('error', -4001);
          case 'P2003':
            return new ApiResponse('error', -4002);
          case 'P2025':
            return new ApiResponse('error', -4003);
        }
      }
      return new ApiResponse('error', -4010);
    }
  }
}
