import {
  Controller,
  Get,
  ValidationPipe,
  Post,
  HttpCode,
  UsePipes,
  Body,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { OrderDto } from './dto/order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Auth('admin')
  getAll() {
    return this.orderService.getAll();
  }

  @Get('by-user')
  @Auth()
  getByUserId(@CurrentUser('id') id: number) {
    return this.orderService.getByUserId(id);
  }

  @UsePipes(new ValidationPipe())
  @Auth()
  @Post()
  @HttpCode(200)
  placeOrder(@Body() dto: OrderDto, @CurrentUser('id') id: number) {
    return this.orderService.placeOrder(dto, id);
  }
}
