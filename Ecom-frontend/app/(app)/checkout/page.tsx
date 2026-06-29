"use client";

import { AuthGuard } from "@root/guards";
import { Checkout } from "@sections/store/checkout";

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <Checkout />
    </AuthGuard>
  );
}
