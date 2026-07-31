import { Injectable } from '@nestjs/common';
import { User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserData } from './interfaces/create-user-data.interface';

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

  async updateUser() {}

  async deactivateUser() {}
}
