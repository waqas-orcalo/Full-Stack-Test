import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, SortOrder, Types, isValidObjectId } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductSortBy, QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

export interface ProductListResult {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  /**
   * Content-based suggestions: up to 4 products in the same category as the
   * viewed one, excluding itself and (when authenticated) anything the user has
   * already ordered. Newest first.
   */
  async findSuggestions(id: string, userId?: string): Promise<Product[]> {
    const product = await this.findOne(id); // 404s for bad/unknown id

    const excludeIds: Types.ObjectId[] = [new Types.ObjectId(id)];
    if (userId) {
      const orders = await this.orderModel
        .find({ user: new Types.ObjectId(userId) })
        .select('items.product')
        .exec();
      for (const order of orders) {
        for (const item of order.items) {
          excludeIds.push(item.product);
        }
      }
    }

    return this.productModel
      .find({
        category: product.category,
        deletedAt: null,
        isActive: true,
        _id: { $nin: excludeIds },
      })
      .sort({ createdAt: -1 })
      .limit(4)
      .exec();
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const sku = dto.sku.trim().toUpperCase();
    const exists = await this.productModel.exists({ sku, deletedAt: null });
    if (exists) {
      throw new ConflictException(`Product with SKU "${sku}" already exists`);
    }
    return this.productModel.create({ ...dto, sku });
  }

  async findAll(query: QueryProductDto): Promise<ProductListResult> {
    const { page, limit, search, category, minPrice, maxPrice, sortBy } = query;

    const filter: FilterQuery<ProductDocument> = { deletedAt: null };
    if (category) {
      filter.category = category;
    }
    // Search by name (case-insensitive, ILIKE-equivalent).
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    // Price range (combinable).
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    const sort: Record<string, SortOrder> =
      sortBy === ProductSortBy.PRICE_ASC
        ? { price: 1 }
        : sortBy === ProductSortBy.PRICE_DESC
          ? { price: -1 }
          : { createdAt: -1 }; // newest (default)

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<Product> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    const product = await this.productModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Product ${id} not found`);
    }
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
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Product ${id} not found`);
    }
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
