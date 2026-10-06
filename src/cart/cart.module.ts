import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartUserController } from './cart.user.controller';
import { OrderLogService } from './orderLog.service';

@Module({
  controllers: [CartUserController],
  providers: [CartService, OrderLogService],
  exports: [CartService, OrderLogService],
})
export class CartModule {}
