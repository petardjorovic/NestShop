import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartUserController } from './cart.user.controller';

@Module({
  controllers: [CartUserController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
