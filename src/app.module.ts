import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import envValidation from './config/env.validations';
import appConfig from './config/app.config';
import databaseConfig from './config/database.configuration';
import { PrismaModule } from './prisma.module';
import { AppController } from './controllers/app.controller';
import { AdministratorController } from './controllers/api/administrator.controller';
import { UserController } from './controllers/api/user.controller';
import { AdministratorService } from './services/administrator/administrator.service';
import { UserService } from './services/user/user.service';
import { CategoryController } from './controllers/api/category.controller';
import { CategoryService } from './services/category/category.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: envValidation,
      load: [appConfig, databaseConfig],
    }),
    PrismaModule,
  ],
  controllers: [
    AppController,
    AdministratorController,
    UserController,
    CategoryController,
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
  ],
})
export class AppModule {}
