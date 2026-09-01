import { Article } from 'src/generated/prisma/client';
import {
  Body,
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/responses/api.response.class';
import { ArticleQueryDto } from 'src/article/dtos/article.query.dto';
import { AddArticleDto } from 'src/article/dtos/add.article.dto';
import { EditArticleDto } from 'src/article/dtos/edit.article.dto';
import { ArticleService } from './article.service';
import { AdminProtected } from 'src/auth/decorators/admin-protected.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller({
  path: 'article',
  version: '1',
})
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

  @AdminProtected()
  @Post()
  add(@Body() addArticleDto: AddArticleDto) {
    return this.articleService.add(addArticleDto);
  }

  @AdminProtected()
  @Patch(':id')
  edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() editArticleDto: EditArticleDto,
  ): Promise<Article | ApiResponse> {
    return this.articleService.edit(id, editArticleDto);
  }

  @Post(':id/uploadPhoto')
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(@Param('id', ParseIntPipe) id: number) {}

  // @Delete(':id')
  // delete(@Param('id', ParseIntPipe) id: number) {}
}
