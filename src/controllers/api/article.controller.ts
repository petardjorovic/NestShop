import { Article } from 'src/generated/prisma/client';
import { ArticleService } from './../../services/article/article.service';
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
import { ApiResponse } from 'src/misc/api.response.class';
import { ArticleQueryDto } from 'src/dtos/article/article.query.dto';
import { AddArticleDto } from 'src/dtos/article/add.article.dto';
import { EditArticleDto } from 'src/dtos/article/edit.article.dto';

@Controller('api/article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  getAll(@Query() query: ArticleQueryDto): Promise<Article[]> {
    return this.articleService.getAll(query);
  }

  @Get(':id')
  getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Article | ApiResponse> {
    return this.articleService.getById(id);
  }

  @Post()
  add(@Body() addArticleDto: AddArticleDto) {
    return this.articleService.add(addArticleDto);
  }

  @Patch(':id')
  edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() editArticleDto: EditArticleDto,
  ): Promise<Article | ApiResponse> {
    return this.articleService.edit(id, editArticleDto);
  }
}
