import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('orders')
  @ApiOperation({ summary: 'List all orders (admin)' })
  async orders() {
    return ApiResponseDto.of(await this.adminService.findAllOrders(), 'All orders');
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get a single order with customer info (admin)' })
  async order(@Param('id') id: string) {
    return ApiResponseDto.of(await this.adminService.findOrder(id), 'Order');
  }

  @Get('customers')
  @ApiOperation({ summary: 'List customers with order stats (admin)' })
  async customers() {
    return ApiResponseDto.of(await this.adminService.findAllCustomers(), 'Customers');
  }

  @Get('stats')
  @ApiOperation({ summary: 'Dashboard statistics (admin)' })
  async stats() {
    return ApiResponseDto.of(await this.adminService.getStats(), 'Stats');
  }
}
