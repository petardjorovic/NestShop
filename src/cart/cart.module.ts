import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartUserController } from './cart.user.controller';
import { OrderLogService } from './orderLog.service';
import { MailModule } from 'src/mail/mail.module';
import { CartAdministratorController } from './cart.administrator.controller';

@Module({
  imports: [MailModule],
  controllers: [CartUserController, CartAdministratorController],
  providers: [CartService, OrderLogService],
  exports: [CartService, OrderLogService],
})
export class CartModule {}
