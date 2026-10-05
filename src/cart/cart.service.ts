import { Injectable } from '@nestjs/common';
import { Cart } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getLastActiveCartByUserId(userId: number): Promise<Cart | null> {
    // find last user's cart
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 1,
      include: {
        orderLog: true,
      },
    });

    // check if user has any cart
    if (!cart) {
      return null;
    }

    // check if cart has already been used
    if (cart.orderLog !== null) {
      return null;
    }

    // return cart
    return this.getById(cart.cartId);
  }

  async createNewCartForUser(userId: number): Promise<Cart> {
    return await this.prisma.cart.create({
      data: { userId },
    });
  }

  async addArticleToCart(
    cartId: number,
    articleId: number,
    quantity: number,
  ): Promise<Cart | null> {
    // pronadji cartArticle i ako postoji onda update, inace create new
    await this.prisma.cartArticle.upsert({
      where: { cartId_articleId: { cartId, articleId } },
      create: { cartId, articleId, quantity },
      update: { quantity: { increment: quantity } },
    });

    return this.getById(cartId);
  }

  async getById(cartId: number): Promise<Cart | null> {
    return this.prisma.cart.findUnique({
      where: { cartId },
      include: {
        articles: { include: { article: { include: { category: true } } } },
        user: { omit: { passwordHash: true, deletedAt: true, isActive: true } },
      },
    });
  }

  async changeQuantity(
    cartId: number,
    articleId: number,
    newQuantity: number,
  ): Promise<Cart | null> {
    const cartArticle = await this.prisma.cartArticle.findUnique({
      where: { cartId_articleId: { cartId, articleId } },
    });

    if (cartArticle) {
      if (newQuantity === 0) {
        await this.prisma.cartArticle.delete({
          where: { cartId_articleId: { cartId, articleId } },
        });
      } else {
        await this.prisma.cartArticle.update({
          where: { cartId_articleId: { cartId, articleId } },
          data: { quantity: newQuantity },
        });
      }
    }

    return this.getById(cartId);
  }
}
