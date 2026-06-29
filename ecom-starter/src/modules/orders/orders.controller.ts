import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Check out the cart and create an order' })
  async checkout(@CurrentUser('id') userId: string, @Body() dto: CheckoutDto) {
    const order = await this.ordersService.checkout(userId, dto.paymentToken);
    return ApiResponseDto.of(order, 'Order placed');
  }

  @Get('orders')
  @ApiOperation({ summary: "List the current user's orders" })
  async list(@CurrentUser('id') userId: string) {
    const orders = await this.ordersService.findAllForUser(userId);
    return ApiResponseDto.of(orders, 'Orders');
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get a single order (owner only)' })
  async getOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    const order = await this.ordersService.findOne(userId, id);
    return ApiResponseDto.of(order, 'Order');
  }

  @Patch('orders/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an order status (admin only)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    const order = await this.ordersService.updateStatus(id, dto.status);
    return ApiResponseDto.of(order, 'Order status updated');
  }
}
