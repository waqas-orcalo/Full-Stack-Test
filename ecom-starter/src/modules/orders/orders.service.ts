import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

const SUCCESS_TOKEN = 'tok_test_success';

/** Allowed status transitions for an order's lifecycle. */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async checkout(userId: string, paymentToken: string): Promise<Order> {
    const userObjectId = new Types.ObjectId(userId);

    // 1. Load the user's cart with product details.
    const cart = await this.cartModel
      .findOne({ user: userObjectId })
      .populate<{ items: { product: ProductDocument | null; quantity: number }[] }>(
        'items.product',
      )
      .exec();

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    // 2. Validate every item + 3. compute total from CURRENT prices.
    let totalAmount = 0;
    const orderItems = cart.items.map(({ product, quantity }) => {
      if (!product || product.deletedAt) {
        throw new BadRequestException('A product in your cart is no longer available');
      }
      if (product.stockQuantity < quantity) {
        throw new BadRequestException(
          `Only ${product.stockQuantity} of "${product.name}" in stock`,
        );
      }
      totalAmount += product.price * quantity;
      return {
        product: product._id,
        name: product.name,
        priceAtPurchase: product.price,
        quantity,
      };
    });
    totalAmount = Math.round(totalAmount * 100) / 100;

    // 4. Simulate payment.
    if (paymentToken !== SUCCESS_TOKEN) {
      throw new HttpException('Payment required', HttpStatus.PAYMENT_REQUIRED);
    }

    // 5. Create order, decrement stock, clear cart.
    const order = await this.orderModel.create({
      user: userObjectId,
      items: orderItems,
      totalAmount,
      status: OrderStatus.PENDING,
    });

    await Promise.all(
      orderItems.map((item) =>
        this.productModel
          .updateOne({ _id: item.product }, { $inc: { stockQuantity: -item.quantity } })
          .exec(),
      ),
    );

    await this.cartModel.updateOne({ user: userObjectId }, { $set: { items: [] } }).exec();

    // 6. Return the created order.
    return order;
  }

  async findAllForUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /** Admin: advance an order's status, enforcing a valid transition. */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Order not found');
    }
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status === status) {
      return order;
    }
    if (!ALLOWED_TRANSITIONS[order.status].includes(status)) {
      throw new BadRequestException(
        `Cannot change status from "${order.status}" to "${status}"`,
      );
    }
    order.status = status;
    await order.save();
    return order;
  }

  async findOne(userId: string, id: string): Promise<Order> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Order not found');
    }
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.user.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }
    return order;
  }
}
