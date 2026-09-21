import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { PhotoModule } from 'src/photo/photo.module';

@Module({
  imports: [PhotoModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
