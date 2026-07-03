import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Administrator } from 'src/generated/prisma/client';
import { ApiResponse } from 'src/misc/api.response.class';
import { PrismaService } from 'src/prisma.service';
import { CreateAdministratorDto } from './dtos/create-administrator.dto';
import { EditAdministratorDto } from './dtos/edit-administrator.dto';

@Injectable()
export class AdministratorService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Administrator[]> {
    return this.prisma.administrator.findMany();
  }

  async findById(
    administratorId: number,
  ): Promise<Administrator | ApiResponse> {
    const admin = await this.prisma.administrator.findUnique({
      where: { administratorId },
    });
    if (!admin) {
      return new ApiResponse('error', 10001);
    }
    return admin;
  }

  async addAdministrator({
    username,
    password,
  }: CreateAdministratorDto): Promise<Administrator | ApiResponse> {
    const existingAdministrator = await this.prisma.administrator.findUnique({
      where: { username },
    });

    if (existingAdministrator) {
      return new ApiResponse('error', 10002);
    }

    let passwordHash: string;
    try {
      passwordHash = await argon2.hash(password);
    } catch (error) {
      console.error(error);
      return new ApiResponse('error', 10003);
    }

    return this.prisma.administrator.create({
      data: {
        username,
        passwordHash,
      },
    });
  }

  async editAdministrator(
    administratorId: number,
    data: EditAdministratorDto,
  ): Promise<Administrator | ApiResponse> {
    try {
      let passwordHash: string | undefined;

      if (data.password) {
        try {
          passwordHash = await argon2.hash(data.password);
        } catch (error) {
          console.error(error);
          return new ApiResponse('error', 10003);
        }
      }

      return await this.prisma.administrator.update({
        where: { administratorId },
        data: {
          ...(data.username && { username: data.username }),
          ...(passwordHash && { passwordHash }),
        },
      });
    } catch (error) {
      console.error(error);
      return new ApiResponse('error', 10001);
    }
  }
}
