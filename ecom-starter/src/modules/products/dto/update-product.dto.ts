import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/**
 * All fields optional for PATCH semantics. Inherits validation rules from
 * CreateProductDto via PartialType.
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
