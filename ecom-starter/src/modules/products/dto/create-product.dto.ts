import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Ergonomic 2.4GHz wireless mouse' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 29.99, description: 'Must be a positive number' })
  @IsPositive({ message: 'price must be a positive number' })
  price: number;

  @ApiProperty({ example: 'WM-001' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({ example: 100, default: 0, description: 'Non-negative integer' })
  @IsOptional()
  @IsInt({ message: 'stockQuantity must be an integer' })
  @Min(0, { message: 'stockQuantity must be a non-negative integer' })
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 'accessories', default: 'general' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '/images/abc123.png', description: 'Relative path returned by POST /products/upload' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
