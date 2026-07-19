import { Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdministratorModule } from './administrator/administrator.module';
import { CategoryModule } from './category/category.module';
import { ArticleModule } from './article/article.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import appConfig from './config/app.config';
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
  controllers: [AppController],
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
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
