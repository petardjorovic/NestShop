import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { Logger, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('app.port');
  const appUrl = configService.getOrThrow<string>('app.appUrl');
  const appVersion = configService.getOrThrow<number>('app.appVersion');

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // app.enableCors({
  // origin: ...,  // ovde id url frontenda
  // credentials: true,
  // });

  const config = new DocumentBuilder()
    .setTitle('Shop aplikacija')
    .setDescription('Online e-commerc application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Development only. Production authentication uses HttpOnly cookies.',
      },
      'jwt',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(port);

  logger.log(`Application is running on ${appUrl}/api/v${appVersion}`);
  logger.log(`Swagger docs on ${appUrl}/api/docs`);
}
bootstrap();
