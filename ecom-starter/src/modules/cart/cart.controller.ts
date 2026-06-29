import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get the current user's cart" })
  async get(@CurrentUser('id') userId: string) {
    return ApiResponseDto.of(await this.cartService.getCart(userId), 'Cart');
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to the cart' })
  async add(@CurrentUser('id') userId: string, @Body() dto: AddToCartDto) {
    const cart = await this.cartService.addItem(userId, dto.productId, dto.quantity ?? 1);
    return ApiResponseDto.of(cart, 'Item added to cart');
  }

  @Put('items/:productId')
  @ApiOperation({ summary: 'Set the quantity of a cart item (<= 0 removes it)' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.updateItem(userId, productId, dto.quantity);
    return ApiResponseDto.of(cart, 'Cart updated');
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  async remove(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    const cart = await this.cartService.removeItem(userId, productId);
    return ApiResponseDto.of(cart, 'Item removed');
  }

  @Delete()
  @ApiOperation({ summary: 'Clear the cart' })
  async clear(@CurrentUser('id') userId: string) {
    return ApiResponseDto.of(await this.cartService.clear(userId), 'Cart cleared');
  }
}
