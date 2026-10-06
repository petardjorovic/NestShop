import { UserProtected } from 'src/auth/decorators/user-protected.decorator';
import { CartService } from './cart.service';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type UserAuthUser } from 'src/auth/interfaces/user-auth-user.interface';
import { Cart, OrderLog } from 'src/generated/prisma/client';
import { AddArticleToCartDto } from './dtos/add.article.to.cart.dto';
import { EditArticleInCartDto } from './dtos/edit.article.in.cart.dto';
import { OrderLogService } from './orderLog.service';
import { ApiResponse } from 'src/common/responses/api.response.class';

@Controller({
  path: 'cart/user',
  version: '1',
})
export class CartUserController {
  constructor(
    private readonly cartService: CartService,
    private readonly orderLogService: OrderLogService,
  ) {}

  @UserProtected()
  @Get() // GET http://localhost:3000/api/v1/cart/user
  async getCurrentCart(@CurrentUser() userData: UserAuthUser): Promise<Cart> {
    return this.getCurrentCartForUserId(userData.user.userId);
  }
  @UserProtected()
  @Post('addToCart') // POST http://localhost:3000/api/v1/cart/user/addToCart
  async addToCart(
    @CurrentUser() userData: UserAuthUser,
    @Body() data: AddArticleToCartDto,
  ): Promise<Cart | null> {
    const cart = await this.getCurrentCartForUserId(userData.user.userId);

    return this.cartService.addArticleToCart(
      cart.cartId,
      data.articleId,
      data.quantity,
    );
  }

  @UserProtected()
  @Patch() // PATCH http://localhost:3000/api/v1/cart/user
  async changeQuantity(
    @CurrentUser() userData: UserAuthUser,
    @Body() data: EditArticleInCartDto,
  ) {
    const cart = await this.getCurrentCartForUserId(userData.user.userId);

    return this.cartService.changeQuantity(
      cart.cartId,
      data.articleId,
      data.newQuantity,
    );
  }

  @UserProtected()
  @Post('makeOrder') // POST http://localhost:3000/api/v1/cart/user/makeOrder
  async makeOrder(
    @CurrentUser() userData: UserAuthUser,
  ): Promise<OrderLog | ApiResponse> {
    const cart = await this.getCurrentCartForUserId(userData.user.userId);

    return this.orderLogService.add(cart.cartId);
  }

  private async getCurrentCartForUserId(userId: number): Promise<Cart> {
    let cart = await this.cartService.getLastActiveCartByUserId(userId);

    if (!cart) {
      cart = await this.cartService.createNewCartForUser(userId);
    }

    return cart;
  }
}
