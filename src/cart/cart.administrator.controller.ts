import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { OrderLogService } from './orderLog.service';
import { AllowToUsers } from 'src/auth/decorators/allow-to-users.decorator';
import { JwtSubjectType } from 'src/auth/enums/jwt-subject-type.enum';
import { ChangeOrderStatusDto } from './dtos/change.order.status.dto';
import { OrderWithDetails } from 'src/common/types/OrderWithDetails.type';
import { ApiResponse } from 'src/common/responses/api.response.class';

@Controller({
  path: 'cart/admin',
  version: '1',
})
export class CartAdministratorController {
  constructor(private readonly orderLogService: OrderLogService) {}

  @AllowToUsers(JwtSubjectType.ADMIN)
  @Get(':orderId') // GET http://localhost:3000/api/v1/cart/admin/10
  get(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderWithDetails | ApiResponse> {
    return this.orderLogService.getById(orderId);
  }

  @AllowToUsers(JwtSubjectType.ADMIN)
  @Patch(':orderId') // PATCH http://localhost:3000/api/v1/cart/admin/10
  changeStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() data: ChangeOrderStatusDto,
  ): Promise<OrderWithDetails | ApiResponse> {
    return this.orderLogService.changeStatus(orderId, data.newStatus);
  }
}
