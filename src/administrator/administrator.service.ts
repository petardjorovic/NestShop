import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Administrator } from 'src/generated/prisma/client';
import { ApiResponse } from 'src/misc/api.response.class';
import { AddAdministratorDto } from 'src/dtos/administrator/add.administrator.dto';
import { EditAdministratorDto } from 'src/dtos/administrator/edit.administrator.dto';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class AdministratorService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Administrator[]> {
    return this.prisma.administrator.findMany();
  }

  async findById(
    administratorId: number,
  ): Promise<Administrator | ApiResponse> {
    const administrator = await this.prisma.administrator.findUnique({
      where: { administratorId },
    });

    if (!administrator) {
      return new ApiResponse('error', -1001);
    }

    return administrator;
  }

  findByUsername(username: string): Promise<Administrator | null> {
    return this.prisma.administrator.findUnique({
      where: { username },
    });
  }

  async addAdministrator({
    username,
    password,
  }: AddAdministratorDto): Promise<Administrator | ApiResponse> {
    const existingAdministrator = await this.prisma.administrator.findUnique({
      where: { username },
    });

    if (existingAdministrator) {
      return new ApiResponse('error', -1002);
    }

    let passwordHash: string;

    try {
      passwordHash = await argon2.hash(password);
    } catch (error) {
      console.error(error);
      return new ApiResponse('error', -1003);
    }

    return this.prisma.administrator.create({
      data: {
        username,
        passwordHash,
      },
    });
  }

  async editById(
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
          return new ApiResponse('error', -1003);
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
      return new ApiResponse('error', -1001);
    }
  }

  async validateAdministrator(
    username: string,
    password: string,
  ): Promise<Administrator> {
    const admin = await this.prisma.administrator.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(admin.passwordHash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return admin;
  }
}
