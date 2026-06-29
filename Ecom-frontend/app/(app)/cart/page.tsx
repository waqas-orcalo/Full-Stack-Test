"use client";

import { AuthGuard } from "@root/guards";
import { CartView } from "@sections/store/cart-view";

export default function CartPage() {
  return (
    <AuthGuard>
      <CartView />
    </AuthGuard>
  );
}
