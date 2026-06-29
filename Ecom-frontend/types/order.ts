export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  product: string;
  name: string;
  priceAtPurchase: number;
  quantity: number;
}

export interface Order {
  id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

/** Admin order listing — `user` is populated with basic customer info. */
export interface AdminOrder extends Omit<Order, "user"> {
  user: { id?: string; email: string; name: string } | null;
}

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

/** Valid next statuses an admin may move an order to (mirrors backend). */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
