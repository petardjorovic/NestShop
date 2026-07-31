import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdministratorModule } from './administrator/administrator.module';
import { CategoryModule } from './category/category.module';
import { ArticleModule } from './article/article.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import appConfiguration from './config/app.configuration';
import databaseConfiguration from './config/database.configuration';
import envValidation from './config/env.validations';
import mailConfiguration from './config/mail.configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: envValidation,
      load: [appConfiguration, databaseConfiguration, mailConfiguration],
    }),
    PrismaModule,
    AuthModule,
    AdministratorModule,
    CategoryModule,
    ArticleModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
