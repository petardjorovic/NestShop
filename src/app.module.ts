import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdministratorModule } from './administrator/administrator.module';
import { CategoryModule } from './category/category.module';
import { ArticleModule } from './article/article.module';
import { UserModule } from './user/user.module';
// import { AdminJwtGuard } from './auth/guards/admin-jwt.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import appConfig from './config/app.configuration';
import databaseConfig from './config/database.configuration';
import envValidation from './config/env.validations';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: envValidation,
      load: [appConfig, databaseConfig],
    }),
    PrismaModule,
    AuthModule,
    AdministratorModule,
    CategoryModule,
    ArticleModule,
    UserModule,
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
    // {
    //   provide: APP_GUARD,
    //   useClass: AdminJwtGuard,
    // },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
