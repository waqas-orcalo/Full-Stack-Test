"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  useAddToCartMutation,
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@services/app/cart-api";
import { useAuth } from "@hooks/use-auth";
import type { CartLine } from "@root/types/cart";

interface CartContextValue {
  cartItems: CartLine[];
  totalItems: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * App-wide cart state, backed by the server (RTK Query). The cart is fetched
 * only when authenticated and reflects the server on every change (no optimistic
 * updates). On logout the auth flow resets the API cache, so this returns empty.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [add] = useAddToCartMutation();
  const [update] = useUpdateCartItemMutation();
  const [remove] = useRemoveCartItemMutation();

  const cart = isAuthenticated ? data?.data : undefined;

  const value: CartContextValue = {
    cartItems: cart?.items ?? [],
    totalItems: cart?.totalItems ?? 0,
    subtotal: cart?.subtotal ?? 0,
    total: cart?.total ?? 0,
    isLoading: isAuthenticated && isLoading,
    addItem: async (productId, quantity = 1) => {
      await add({ productId, quantity }).unwrap();
    },
    updateItem: async (productId, quantity) => {
      await update({ productId, quantity }).unwrap();
    },
    removeItem: async (productId) => {
      await remove(productId).unwrap();
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
