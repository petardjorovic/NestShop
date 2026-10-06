import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/responses/api.response.class';
import { OrderLog } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderLogService {
  constructor(private readonly prisma: PrismaService) {}

  async add(cartId: number): Promise<OrderLog | ApiResponse> {
    const orderLog = await this.prisma.orderLog.findUnique({
      where: { cartId },
    });

    if (orderLog) {
      return new ApiResponse(
        'error',
        -7001,
        'An order for this cart has already been made.',
      );
    }

    const cart = await this.prisma.cart.findUnique({
      where: { cartId },
      include: { articles: true },
    });

    if (!cart) {
      return new ApiResponse('error', -7002, 'No such cart found');
    }

    if (cart.articles.length === 0) {
      return new ApiResponse('error', -7003, 'This cart is empty');
    }

    return this.prisma.orderLog.create({
      data: { cartId },
      include: {
        cart: {
          include: {
            articles: {
              include: {
                article: {
                  include: {
                    category: true,
                    articlePrices: true,
                  },
                },
              },
            },
            user: {
              omit: { isActive: true, passwordHash: true, deletedAt: true },
            },
          },
        },
      },
    });
  }
}
