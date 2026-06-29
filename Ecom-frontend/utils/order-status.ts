import type { ChipProps } from "@mui/material";
import type { OrderStatus } from "@root/types/order";

/** Maps an order status to a label + MUI chip color (consistent everywhere). */
export function orderStatusChip(status: OrderStatus): {
  label: string;
  color: ChipProps["color"];
} {
  const map: Record<OrderStatus, { label: string; color: ChipProps["color"] }> = {
    pending: { label: "Pending", color: "warning" },
    processing: { label: "Processing", color: "info" },
    shipped: { label: "Shipped", color: "secondary" },
    delivered: { label: "Delivered", color: "success" },
    cancelled: { label: "Cancelled", color: "error" },
  };
  return map[status] ?? { label: status, color: "default" };
}
