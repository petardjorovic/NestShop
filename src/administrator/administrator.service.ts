import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Administrator,
  AdministratorSession,
} from 'src/generated/prisma/client';
import { AddAdministratorDto } from './dtos/add.administrator.dto';
import { EditAdministratorDto } from './dtos/edit.administrator.dto';
import { PrismaTransactionClient } from 'src/prisma/types/prisma-transaction-client.type';
import { ApiResponse } from 'src/common/responses/api.response.class';

@Injectable()
export class AdministratorService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Administrator[]> {
    return this.prisma.administrator.findMany();
  }

  async findById(administratorId: number): Promise<Administrator | null> {
    return this.prisma.administrator.findUnique({
      where: { administratorId },
    });
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

  async updatePassword(
    administratorId: number,
    newPasswordHash: string,
    tx?: PrismaTransactionClient,
  ) {
    const prisma = tx ?? this.prisma;

    return prisma.administrator.update({
      where: { administratorId },
      data: { passwordHash: newPasswordHash },
    });
  }

  getActiveSessions(administratorId: number): Promise<AdministratorSession[]> {
    return this.prisma.administratorSession.findMany({
      where: {
        administratorId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });
  }

  async revokeAllSessions(
    administratorId: number,
    tx?: PrismaTransactionClient,
  ): Promise<void> {
    const prisma = tx ?? this.prisma;

    await prisma.administratorSession.updateMany({
      where: { administratorId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllSessionsExceptCurrentOne(
    administratorId: number,
    currentSessionUuid: string,
    tx?: PrismaTransactionClient,
  ): Promise<void> {
    const prisma = tx ?? this.prisma;

    await prisma.administratorSession.updateMany({
      where: {
        administratorId,
        revokedAt: null,
        NOT: { sessionUuid: currentSessionUuid },
      },
      data: { revokedAt: new Date() },
    });
  }
}
