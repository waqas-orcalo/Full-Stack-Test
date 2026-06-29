import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

export interface CartLine {
  product: Product & { id: string };
  quantity: number;
  lineTotal: number;
}
export interface CartView {
  items: CartLine[];
  totalItems: number;
  subtotal: number;
  total: number;
}

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  /** Returns the user's cart as a priced view, creating an empty one if needed. */
  async getCart(userId: string): Promise<CartView> {
    const cart = await this.cartModel
      .findOne({ user: new Types.ObjectId(userId) })
      .populate({ path: 'items.product' })
      .exec();

    if (!cart) return { items: [], totalItems: 0, subtotal: 0, total: 0 };

    const lines: CartLine[] = [];
    for (const item of cart.items) {
      const product = item.product as unknown as ProductDocument | null;
      // Skip products that were deleted/soft-deleted since being added.
      if (!product || product.deletedAt) continue;
      const json = product.toJSON() as unknown as Product & { id: string };
      lines.push({
        product: json,
        quantity: item.quantity,
        lineTotal: round(product.price * item.quantity),
      });
    }

    const subtotal = round(lines.reduce((s, l) => s + l.lineTotal, 0));
    return {
      items: lines,
      totalItems: lines.reduce((s, l) => s + l.quantity, 0),
      subtotal,
      total: subtotal,
    };
  }

  async addItem(userId: string, productId: string, quantity = 1): Promise<CartView> {
    const product = await this.requireActiveProduct(productId);

    const cart = await this.getOrCreate(userId);
    const existing = cart.items.find((i) => i.product.toString() === productId);
    const nextQty = (existing?.quantity ?? 0) + quantity;
    this.assertStock(product, nextQty);

    if (existing) {
      existing.quantity = nextQty;
    } else {
      cart.items.push({ product: new Types.ObjectId(productId), quantity });
    }
    await cart.save();
    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, quantity: number): Promise<CartView> {
    // Per spec: a non-positive quantity removes the item entirely.
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }
    const product = await this.requireActiveProduct(productId);
    this.assertStock(product, quantity);

    const cart = await this.getOrCreate(userId);
    const existing = cart.items.find((i) => i.product.toString() === productId);
    if (!existing) {
      throw new NotFoundException('Item not in cart');
    }
    existing.quantity = quantity;
    await cart.save();
    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<CartView> {
    const cart = await this.getOrCreate(userId);
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    return this.getCart(userId);
  }

  async clear(userId: string): Promise<CartView> {
    await this.cartModel.updateOne({ user: new Types.ObjectId(userId) }, { $set: { items: [] } }, { upsert: true });
    return { items: [], totalItems: 0, subtotal: 0, total: 0 };
  }

  private async getOrCreate(userId: string): Promise<CartDocument> {
    const userObjectId = new Types.ObjectId(userId);
    const cart = await this.cartModel
      .findOneAndUpdate(
        { user: userObjectId },
        { $setOnInsert: { user: userObjectId, items: [] } },
        { upsert: true, new: true },
      )
      .exec();
    return cart!;
  }

  private async requireActiveProduct(productId: string): Promise<ProductDocument> {
    if (!isValidObjectId(productId)) {
      throw new NotFoundException('Product not found');
    }
    const product = await this.productModel
      .findOne({ _id: productId, deletedAt: null })
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  private assertStock(product: ProductDocument, quantity: number) {
    if (quantity > product.stockQuantity) {
      throw new BadRequestException(
        `Only ${product.stockQuantity} of "${product.name}" in stock`,
      );
    }
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
