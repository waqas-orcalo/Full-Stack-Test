import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  async create(@Body() dto: CreateProductDto) {
    const product = await this.productsService.create(dto);
    return ApiResponseDto.of(product, 'Product created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List products (paginated, filterable)' })
  async findAll(@Query() query: QueryProductDto) {
    const result = await this.productsService.findAll(query);
    return ApiResponseDto.of(result, 'Products fetched successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiParam({ name: 'id', description: 'Product id (Mongo ObjectId)' })
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return ApiResponseDto.of(product, 'Product fetched successfully');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product id (Mongo ObjectId)' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.productsService.update(id, dto);
    return ApiResponseDto.of(product, 'Product updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a product' })
  @ApiParam({ name: 'id', description: 'Product id (Mongo ObjectId)' })
  async remove(@Param('id') id: string) {
    const result = await this.productsService.remove(id);
    return ApiResponseDto.of(result, 'Product deleted successfully');
  }
}
