import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    cloudinary.config({
      cloud_name: configService.getOrThrow<string>('cloudinary.cloudName'),
      api_key: configService.getOrThrow<string>('cloudinary.apiKey'),
      api_secret: configService.getOrThrow<string>('cloudinary.apiSecret'),
    });

    return cloudinary;
  },
};
