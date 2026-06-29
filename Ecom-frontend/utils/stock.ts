import type { ChipProps } from "@mui/material";

export interface StockBadge {
  label: string;
  color: ChipProps["color"];
}

/** Stock badge semantics shared across the storefront. */
export function stockBadge(qty: number): StockBadge {
  if (qty <= 0) return { label: "Out of stock", color: "error" };
  if (qty <= 5) return { label: "Low stock", color: "warning" };
  return { label: "In stock", color: "success" };
}
