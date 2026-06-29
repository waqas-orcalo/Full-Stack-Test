import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  deltas: {
    revenuePct: number;
    ordersPct: number;
    avgPct: number;
    newCustomers: number;
  };
  ordersByStatus: Record<OrderStatus, number>;
  salesOverTime: { label: string; total: number }[];
  topProducts: { name: string; category: string; unitsSold: number; revenue: number }[];
}

const DAY = 24 * 60 * 60 * 1000;
const round = (n: number) => Math.round(n * 100) / 100;
const pct = (now: number, prev: number) =>
  prev === 0 ? (now > 0 ? 100 : 0) : round(((now - prev) / prev) * 100);

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAllOrders(): Promise<Order[]> {
    return this.orderModel.find().populate('user', 'email name').sort({ createdAt: -1 }).exec();
  }

  /** Customers with their order count and total spent. */
  async findAllCustomers() {
    const [customers, orders] = await Promise.all([
      this.userModel
        .find({ role: UserRole.CUSTOMER, deletedAt: null })
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.orderModel.find().select('user totalAmount').lean().exec(),
    ]);

    const byUser = new Map<string, { orderCount: number; totalSpent: number }>();
    for (const o of orders) {
      const key = o.user.toString();
      const cur = byUser.get(key) ?? { orderCount: 0, totalSpent: 0 };
      cur.orderCount += 1;
      cur.totalSpent += o.totalAmount;
      byUser.set(key, cur);
    }

    return customers.map((c) => {
      const stats = byUser.get(c._id.toString()) ?? { orderCount: 0, totalSpent: 0 };
      return {
        id: c._id.toString(),
        name: c.name,
        email: c.email,
        createdAt: (c as { createdAt?: Date }).createdAt,
        orderCount: stats.orderCount,
        totalSpent: Math.round(stats.totalSpent * 100) / 100,
      };
    });
  }

  async getStats(): Promise<AdminStats> {
    const now = Date.now();
    const [orders, products, totalCustomers, newCustomers] = await Promise.all([
      this.orderModel.find().select('totalAmount status items createdAt').lean().exec(),
      this.productModel.find().select('name category').lean().exec(),
      this.userModel.countDocuments({ role: UserRole.CUSTOMER, deletedAt: null }).exec(),
      this.userModel
        .countDocuments({ role: UserRole.CUSTOMER, createdAt: { $gte: new Date(now - 30 * DAY) } })
        .exec(),
    ]);

    const categoryByName = new Map(products.map((p) => [p.name, p.category]));
    const ts = (o: Record<string, unknown>) =>
      o.createdAt ? new Date(o.createdAt as string | Date).getTime() : now;

    const totalOrders = orders.length;
    const totalRevenue = round(
      orders.filter((o) => o.status === OrderStatus.DELIVERED).reduce((s, o) => s + o.totalAmount, 0),
    );
    const allSales = orders.reduce((s, o) => s + o.totalAmount, 0);
    const avgOrderValue = totalOrders ? round(allSales / totalOrders) : 0;

    // Period deltas: last 30 days vs the prior 30.
    const last30 = orders.filter((o) => ts(o) >= now - 30 * DAY);
    const prev30 = orders.filter((o) => ts(o) >= now - 60 * DAY && ts(o) < now - 30 * DAY);
    const sum = (a: typeof orders) => a.reduce((s, o) => s + o.totalAmount, 0);
    const avg = (a: typeof orders) => (a.length ? sum(a) / a.length : 0);
    const deltas = {
      revenuePct: pct(sum(last30), sum(prev30)),
      ordersPct: pct(last30.length, prev30.length),
      avgPct: pct(avg(last30), avg(prev30)),
      newCustomers,
    };

    // Orders by status (all statuses present).
    const ordersByStatus = Object.values(OrderStatus).reduce(
      (acc, s) => ({ ...acc, [s]: 0 }),
      {} as Record<OrderStatus, number>,
    );
    for (const o of orders) ordersByStatus[o.status]++;

    // Sales over the last 6 weeks (oldest → newest).
    const salesOverTime = Array.from({ length: 6 }, (_, i) => {
      const start = now - (6 - i) * 7 * DAY;
      const end = now - (5 - i) * 7 * DAY;
      const total = orders.filter((o) => ts(o) >= start && ts(o) < end).reduce((s, o) => s + o.totalAmount, 0);
      return { label: `W${i + 1}`, total: round(total) };
    });

    // Top 5 products by units sold (with category + revenue).
    const agg = new Map<string, { unitsSold: number; revenue: number }>();
    for (const o of orders) {
      for (const it of o.items) {
        const cur = agg.get(it.name) ?? { unitsSold: 0, revenue: 0 };
        cur.unitsSold += it.quantity;
        cur.revenue += it.priceAtPurchase * it.quantity;
        agg.set(it.name, cur);
      }
    }
    const topProducts = [...agg.entries()]
      .map(([name, v]) => ({
        name,
        category: categoryByName.get(name) ?? '',
        unitsSold: v.unitsSold,
        revenue: round(v.revenue),
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalCustomers,
      deltas,
      ordersByStatus,
      salesOverTime,
      topProducts,
    };
  }
}
