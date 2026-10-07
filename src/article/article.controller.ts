import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  // Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Article } from 'src/generated/prisma/client';
import { ArticleService } from './article.service';
import { ArticleQueryDto } from 'src/article/dtos/article.query.dto';
import { AddArticleDto } from 'src/article/dtos/add.article.dto';
import { EditArticleDto } from 'src/article/dtos/edit.article.dto';
import { ApiResponse } from 'src/common/responses/api.response.class';
import { AllowToUsers } from 'src/auth/decorators/allow-to-users.decorator';
import { JwtSubjectType } from 'src/auth/enums/jwt-subject-type.enum';

@Controller({
  path: 'article',
  version: '1',
})
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get() // GET http://localhost:3000/api/v1/article
  getAll(@Query() query: ArticleQueryDto): Promise<Article[]> {
    return this.articleService.getAll(query);
  }

  @Get(':id') // GET http://localhost:3000/api/v1/article/1
  getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Article | ApiResponse> {
    return this.articleService.getById(id);
  }

  @AllowToUsers(JwtSubjectType.ADMIN)
  @Post() // POST http://localhost:3000/api/v1/article
  add(@Body() addArticleDto: AddArticleDto) {
    return this.articleService.add(addArticleDto);
  }

  @AllowToUsers(JwtSubjectType.ADMIN)
  @Patch(':id') // PATCH http://localhost:3000/api/v1/article/55
  edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() editArticleDto: EditArticleDto,
  ): Promise<Article | ApiResponse> {
    return this.articleService.edit(id, editArticleDto);
  }

  // @Delete(':id')
  // delete(@Param('id', ParseIntPipe) id: number) {}

  @AllowToUsers(JwtSubjectType.ADMIN)
  @Post(':id/uploadPhoto') // POST http://localhost:3000/api/v1/article/24/uploadPhoto
  @UseInterceptors(FileInterceptor('photo'))
  uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: 3 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
            errorMessage: (ctx) =>
              `Validation failed (current file type is '${ctx.file?.mimetype}', expected type is jpeg, png or webp)`,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.articleService.uploadPhoto(id, file);
  }

  @AllowToUsers(JwtSubjectType.ADMIN)
  @Delete(':articleId/deletePhoto/:photoId') // POST http://localhost:3000/api/v1/article/24/deletePhoto/1
  deletePhoto(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.articleService.deletePhoto(articleId, photoId);
  }
}
