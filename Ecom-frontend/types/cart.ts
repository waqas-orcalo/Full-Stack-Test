import type { Product } from "./product";

export interface CartLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  items: CartLine[];
  totalItems: number;
  subtotal: number;
  total: number;
}
