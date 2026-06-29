import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: '665f1a...' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity? = 1;
}

export class UpdateCartItemDto {
  @ApiProperty({ example: 2, description: 'New quantity. <= 0 removes the item.' })
  @IsInt()
  quantity: number;
}
