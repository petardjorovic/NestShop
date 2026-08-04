import { Injectable } from '@nestjs/common';
import { User, UserSession } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserData } from './interfaces/create-user-data.interface';
import { CreateUserWithVerificationTokenData } from './interfaces/create-user-with-verification-token-data.interface';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaTransactionClient } from 'src/prisma/types/prisma-transaction-client.type';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findById(userId: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { userId },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phoneNumber } });
  }

  async createUser(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async createUserWithVerificationToken(
    data: CreateUserWithVerificationTokenData,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          forename: data.forename,
          surname: data.surname,
          phoneNumber: data.phoneNumber,
          postalAddress: data.postalAddress,
        },
      });

      const expiresAt = new Date(
        Date.now() + data.expiresInHours * 60 * 60 * 1000,
      );

      const token = randomBytes(32).toString('hex');

      const tokenHash = this.hashToken(token);

      await tx.verificationToken.create({
        data: {
          userId: user.userId,
          type: data.verificationType,
          expiresAt,
          tokenHash,
        },
      });

      return {
        user,
        token,
        expiresAt,
      };
    });
  }

  async verifyEmail(
    userId: number,
    tx?: PrismaTransactionClient,
  ): Promise<void> {
    const prisma = tx ?? this.prisma;

    await prisma.user.update({
      where: { userId },
      data: {
        emailVerifiedAt: new Date(),
      },
    });
  }

  async updatePassword(
    userId: number,
    newPasswordHash: string,
    tx?: PrismaTransactionClient,
  ) {
    const prisma = tx ?? this.prisma;

    return prisma.user.update({
      where: { userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  async updateUser() {}

  async deactivateUser() {}

  getActiveSessions(userId: number): Promise<UserSession[]> {
    return this.prisma.userSession.findMany({
      where: { userId, revokedAt: null },
    });
  }

  async revokeAllSessions(userId: number, tx?: PrismaTransactionClient) {
    const prisma = tx ?? this.prisma;

    return prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllSessionsExceptCurrentOne(
    userId: number,
    currentSessionUuid: string,
    tx?: PrismaTransactionClient,
  ) {
    const prisma = tx ?? this.prisma;

    return prisma.userSession.updateMany({
      where: {
        userId,
        revokedAt: null,
        NOT: { sessionUuid: currentSessionUuid },
      },
      data: { revokedAt: new Date() },
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
