import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AdministratorModule } from './administrator/administrator.module';
import { UserModule } from './user/user.module';
import envValidation from './config/env.validations';
import appConfig from './config/app.config';
import databaseConfig from './config/database.configuration';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: envValidation,
      load: [appConfig, databaseConfig],
    }),
    PrismaModule,
    AdministratorModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
