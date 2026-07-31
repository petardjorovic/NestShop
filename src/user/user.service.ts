import { Injectable } from '@nestjs/common';
import { User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserData } from './interfaces/create-user-data.interface';
import { CreateUserWithVerificationTokenData } from './interfaces/create-user-with-verification-token-data.interface';
import { createHash, randomBytes } from 'node:crypto';

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

  async updateUser() {}

  async deactivateUser() {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
