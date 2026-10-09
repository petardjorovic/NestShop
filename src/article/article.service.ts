import { Injectable, NotFoundException } from '@nestjs/common';
import { Article, Photo, Prisma } from 'src/generated/prisma/client';
import { ApiResponse } from 'src/common/responses/api.response.class';
import { ArticleQueryDto } from 'src/article/dtos/article.query.dto';
import { AddArticleDto } from 'src/article/dtos/add.article.dto';
import { EditArticleDto } from 'src/article/dtos/edit.article.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PhotoService } from 'src/photo/photo.service';
import { ArticleSearchDto } from './dtos/article.search.dto';

@Injectable()
export class ArticleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly photoService: PhotoService,
  ) {}

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
          const currentPrice = await tx.articlePrice.findFirst({
            where: { articleId },
            orderBy: [{ createdAt: 'desc' }, { articlePriceId: 'desc' }],
            select: { price: true },
          });

          if (currentPrice && !currentPrice.price.equals(data.price)) {
            await tx.articlePrice.create({
              data: {
                articleId,
                price: data.price,
              },
            });
          }
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

  delete() {}

  async uploadPhoto(
    articleId: number,
    file: Express.Multer.File,
  ): Promise<Photo> {
    const article = await this.prisma.article.findUnique({
      where: { articleId },
      select: { articleId: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.photoService.add(articleId, file);
  }

  async deletePhoto(
    articleId: number,
    photoId: number,
  ): Promise<{
    message: string;
  }> {
    const article = await this.prisma.article.findUnique({
      where: { articleId },
      select: { articleId: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.photoService.delete(articleId, photoId);
  }

  async search(data: ArticleSearchDto): Promise<Article[]> {
    return this.prisma.$transaction(
      async (tx) => {
        const sortColumn = data.orderBy === 'price' ? 'cp.price' : 'a.name';
        const sortDirection = data.orderDirection ?? 'ASC';
        const keywords =
          data.keywords === undefined
            ? undefined
            : this.escapeLikePattern(data.keywords.trim());

        const featureConditions = (data.features ?? []).map(
          (feature) => Prisma.sql`
      EXISTS (
        SELECT 1
        FROM article_feature AS af
        WHERE af.article_id = a.article_id
          AND af.feature_id = ${feature.featureId}
          AND af.value IN (${Prisma.join(feature.values)})
      )
    `,
        );

        const featureFilter =
          featureConditions.length > 0
            ? Prisma.sql`AND ${Prisma.join(featureConditions, ' AND ')}`
            : Prisma.empty;
        const page = data.page ?? 1;
        const itemsPerPage = data.itemsPerPage ?? 10;
        const offset = (page - 1) * itemsPerPage;

        const result: { articleId: number }[] = await tx.$queryRaw`
        SELECT
          a.article_id AS "articleId"
        FROM article AS a
        JOIN article_current_price AS cp
          ON a.article_id = cp.article_id
        WHERE a.category_id = ${data.categoryId}
          AND (${data.priceMin ?? null}::numeric IS NULL
            OR cp.price >= ${data.priceMin ?? null})
          AND (${data.priceMax ?? null}::numeric IS NULL
            OR cp.price <= ${data.priceMax ?? null})
          AND (
            ${keywords ?? null}::text IS NULL
            OR a.name ILIKE '%' || ${keywords ?? null} || '%' ESCAPE CHR(92)
            OR a.excerpt ILIKE '%' || ${keywords ?? null} || '%' ESCAPE CHR(92)
            OR a.description ILIKE '%' || ${keywords ?? null} || '%' ESCAPE CHR(92)
          )
          ${featureFilter}
        ORDER BY ${Prisma.raw(sortColumn)} ${Prisma.raw(sortDirection)}, a.article_id ASC
        LIMIT ${itemsPerPage}
        OFFSET ${offset}
      `;

        const articleIds = result.map((article) => article.articleId);

        const articles = await tx.article.findMany({
          where: { articleId: { in: articleIds } },
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

        const order = new Map(articleIds.map((id, index) => [id, index]));

        const sortedArticles = articles.sort(
          (a, b) => order.get(a.articleId)! - order.get(b.articleId)!,
        );

        return sortedArticles;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  private escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, (char) => `\\${char}`);
  }
}
