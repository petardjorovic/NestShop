import { Article } from 'src/generated/prisma/client';
import { ArticleService } from './../../services/article/article.service';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiResponse } from 'src/misc/api.response.class';

@Controller('api/article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  getAll(): Promise<Article[]> {
    return this.articleService.getAll();
  }

  @Get(':id')
  getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Article | ApiResponse> {
    return this.articleService.getById(id);
  }
}
