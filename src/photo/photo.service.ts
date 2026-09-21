import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Photo } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PhotoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async add(articleId: number, file: Express.Multer.File): Promise<Photo> {
    const result = await this.cloudinaryService.uploadFile(file);

    try {
      return await this.prisma.photo.create({
        data: {
          articleId,
          publicId: result.public_id,
          imageUrl: result.secure_url,
        },
      });
    } catch (error) {
      await this.cloudinaryService.deleteFile(result.public_id);

      throw error;
    }
  }

  async delete(
    articleId: number,
    photoId: number,
  ): Promise<{ message: string }> {
    const photo = await this.prisma.photo.findFirst({
      where: { photoId, articleId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.cloudinaryService.deleteFile(photo.publicId);

    await this.prisma.photo.delete({
      where: { photoId: photo.photoId },
    });

    return {
      message: 'Photo deleted successfully',
    };
  }
}
