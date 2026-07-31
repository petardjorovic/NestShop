import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerificationToken } from 'src/generated/prisma/client';
import { VerificationType } from 'src/generated/prisma/enums';
import { PrismaTransactionClient } from 'src/prisma/types/prisma-transaction-client.type';

@Injectable()
export class VerificationTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    type: VerificationType,
    expiresInHours: number,
  ): Promise<string> {
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const token = randomBytes(32).toString('hex');

    const tokenHash = this.hashToken(token);

    await this.prisma.$transaction(async (tx) => {
      await tx.verificationToken.deleteMany({
        where: { userId, type, usedAt: null },
      });

      await tx.verificationToken.create({
        data: {
          userId,
          type,
          tokenHash,
          expiresAt,
        },
      });
    });

    return token;
  }

  async verify(
    token: string,
    type: VerificationType,
  ): Promise<VerificationToken> {
    const tokenHash = this.hashToken(token);

    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { tokenHash },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid token');
    }

    if (verificationToken.type !== type) {
      throw new BadRequestException('Invalid token');
    }

    if (verificationToken.usedAt) {
      throw new BadRequestException('Token already used');
    }

    if (verificationToken.expiresAt <= new Date()) {
      throw new BadRequestException('Token expired');
    }

    return verificationToken;
  }

  async markAsUsed(
    verificationTokenId: number,
    tx?: PrismaTransactionClient,
  ): Promise<void> {
    const prisma = tx ?? this.prisma;

    await prisma.verificationToken.update({
      where: { verificationTokenId },
      data: { usedAt: new Date() },
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
