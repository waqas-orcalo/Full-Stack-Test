"use client";

import { AuthGuard } from "@root/guards";
import { OrderHistory } from "@sections/store/order-history";

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrderHistory />
    </AuthGuard>
  );
}
