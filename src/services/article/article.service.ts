import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Article } from 'src/generated/prisma/client';
import { ApiResponse } from 'src/misc/api.response.class';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(): Promise<Article[]> {
    return this.prisma.article.findMany();
  }

  async getById(articleId: number): Promise<Article | ApiResponse> {
    const article = await this.prisma.article.findUnique({
      where: { articleId },
    });

    if (!article) {
      return new ApiResponse('error', -4001);
    }

    return article;
  }

  add() {}

  edit() {}
}
