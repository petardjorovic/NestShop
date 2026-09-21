import { Module } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  providers: [PhotoService],
  imports: [CloudinaryModule],
  exports: [PhotoService],
})
export class PhotoModule {}
