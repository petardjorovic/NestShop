import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';
import { AppController } from './controllers/app.controller';
import { UserController } from './controllers/api/user.controller';
import { AdministratorController } from './controllers/api/administrator.controller';
import { CategoryController } from './controllers/api/category.controller';
import { ArticleController } from './controllers/api/article.controller';
import { AuthController } from './controllers/api/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { AdministratorService } from './services/administrator/administrator.service';
import { UserService } from './services/user/user.service';
import { CategoryService } from './services/category/category.service';
import { ArticleService } from './services/article/article.service';
import appConfig from './config/app.config';
import databaseConfig from './config/database.configuration';
import envValidation from './config/env.validations';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { AuthModule } from './auth/auth.module';
import { AdministratorModule } from './administrator/administrator.module';

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
  ],
  controllers: [
    AppController,
    AdministratorController,
    UserController,
    CategoryController,
    ArticleController,
    AuthController,
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
    AdministratorService,
    UserService,
    CategoryService,
    ArticleService,
    AuthService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude('auth/*').forRoutes('api/*');
  }
}
