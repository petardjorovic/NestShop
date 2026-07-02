import { Injectable } from '@nestjs/common';
import { Administrator } from 'src/generated/prisma/client';
import { ApiResponse } from 'src/misc/api.response.class';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AdministratorService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Administrator[]> {
    return this.prisma.administrator.findMany();
  }

  async findById(
    administratorId: number,
  ): Promise<Administrator | ApiResponse> {
    const admin = await this.prisma.administrator.findFirst({
      where: { administratorId },
    });
    if (!admin) {
      return new ApiResponse('error', 10001);
    }
    return admin;
  }
}
