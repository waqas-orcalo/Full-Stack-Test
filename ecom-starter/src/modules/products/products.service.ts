import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const sku = dto.sku.trim().toUpperCase();
    const exists = await this.productModel.exists({ sku, deletedAt: null });
    if (exists) {
      throw new ConflictException(`Product with SKU "${sku}" already exists`);
    }
    return this.productModel.create({ ...dto, sku });
  }

  async findAll(query: QueryProductDto): Promise<PaginatedResult<Product>> {
    const { page, limit, search, category } = query;

    const filter: FilterQuery<ProductDocument> = { deletedAt: null };
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.sku) {
      const sku = dto.sku.trim().toUpperCase();
      const clash = await this.productModel.exists({
        sku,
        deletedAt: null,
        _id: { $ne: id },
      });
      if (clash) {
        throw new ConflictException(`Product with SKU "${sku}" already exists`);
      }
      update.sku = sku;
    }

    const product = await this.productModel
      .findOneAndUpdate({ _id: id, deletedAt: null }, update, { new: true })
      .exec();
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  /**
   * Soft delete — sets deletedAt and isActive=false instead of removing the
   * document, preserving history (COSMONYX-BE-001 convention).
   */
  async remove(id: string): Promise<{ id: string; deleted: boolean }> {
    const product = await this.productModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date(), isActive: false },
        { new: true },
      )
      .exec();
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return { id, deleted: true };
  }
}
