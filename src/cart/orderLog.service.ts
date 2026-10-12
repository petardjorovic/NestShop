import { Injectable, Logger } from '@nestjs/common';
import { ApiResponse } from 'src/common/responses/api.response.class';
import { OrderWithDetails } from 'src/common/types/OrderWithDetails.type';
import { OrderStatus } from 'src/generated/prisma/client';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderLogService {
  private readonly logger = new Logger(OrderLogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async add(cartId: number): Promise<OrderWithDetails | ApiResponse> {
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

    const createdOrder = await this.prisma.orderLog.create({
      data: { cartId },
    });

    const order: OrderWithDetails | null =
      await this.findOrderWithHistoricalPrices(createdOrder.orderLogId);

    if (!order) {
      return new ApiResponse(
        'error',
        -7004,
        'Created order could not be retrieved',
      );
    }

    try {
      await this.mailService.sendOrderConfirmationEmail(order);
    } catch (error) {
      this.logger.error(
        `Failed to send order confirmation email for order ${order.orderLogId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return order;
  }

  async getById(orderId: number): Promise<OrderWithDetails | ApiResponse> {
    const order = await this.findOrderWithHistoricalPrices(orderId);

    if (!order) {
      return new ApiResponse('error', -9001, 'No such order found');
    }

    return order;
  }

  async changeStatus(
    orderId: number,
    newStatus: OrderStatus,
  ): Promise<OrderWithDetails | ApiResponse> {
    await this.prisma.orderLog.update({
      where: { orderLogId: orderId },
      data: { status: newStatus },
    });

    return this.getById(orderId);
  }

  private async findOrderWithHistoricalPrices(
    orderId: number,
  ): Promise<OrderWithDetails | null> {
    const order = await this.prisma.orderLog.findUnique({
      where: { orderLogId: orderId },
      select: { createdAt: true },
    });

    if (!order) return null;

    return this.prisma.orderLog.findUnique({
      where: { orderLogId: orderId },
      include: {
        cart: {
          include: {
            articles: {
              include: {
                article: {
                  include: {
                    category: true,
                    articlePrices: {
                      where: { createdAt: { lte: order.createdAt } },
                      orderBy: [
                        { createdAt: 'desc' },
                        { articlePriceId: 'desc' },
                      ],
                      take: 1,
                    },
                  },
                },
              },
            },
            user: {
              omit: {
                isActive: true,
                passwordHash: true,
                deletedAt: true,
              },
            },
          },
        },
      },
    });
  }
}
