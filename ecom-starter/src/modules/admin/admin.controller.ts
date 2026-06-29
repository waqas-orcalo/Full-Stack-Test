import { Controller, Get, UseGuards } from '@nestjs/common';
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

  @Get('stats')
  @ApiOperation({ summary: 'Dashboard statistics (admin)' })
  async stats() {
    return ApiResponseDto.of(await this.adminService.getStats(), 'Stats');
  }
}
