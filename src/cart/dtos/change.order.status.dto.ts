import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { OrderStatus } from 'src/generated/prisma/enums';

export class ChangeOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['REJECTED', 'ACCEPTED', 'SHIPPED', 'PENDING'])
  newStatus!: OrderStatus;
}
