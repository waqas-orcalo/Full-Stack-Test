import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  ordersByStatus: Record<OrderStatus, number>;
  topProducts: { name: string; unitsSold: number }[];
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  /** All orders with basic customer info, newest first. */
  async findAllOrders(): Promise<Order[]> {
    return this.orderModel
      .find()
      .populate('user', 'email name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getStats(): Promise<AdminStats> {
    const [revenueAgg, totalOrders, statusAgg, topProducts] = await Promise.all([
      this.orderModel.aggregate<{ total: number }>([
        { $match: { status: OrderStatus.DELIVERED } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      this.orderModel.countDocuments().exec(),
      this.orderModel.aggregate<{ _id: OrderStatus; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.orderModel.aggregate<{ name: string; unitsSold: number }>([
        { $unwind: '$items' },
        { $group: { _id: '$items.name', unitsSold: { $sum: '$items.quantity' } } },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, name: '$_id', unitsSold: 1 } },
      ]),
    ]);

    const ordersByStatus = Object.values(OrderStatus).reduce(
      (acc, s) => ({ ...acc, [s]: 0 }),
      {} as Record<OrderStatus, number>,
    );
    for (const row of statusAgg) {
      ordersByStatus[row._id] = row.count;
    }

    return {
      totalRevenue: Math.round((revenueAgg[0]?.total ?? 0) * 100) / 100,
      totalOrders,
      ordersByStatus,
      topProducts,
    };
  }
}
