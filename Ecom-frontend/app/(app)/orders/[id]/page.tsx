"use client";

import { use } from "react";
import { AuthGuard } from "@root/guards";
import { OrderDetail } from "@sections/store/order-detail";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <OrderDetail orderId={id} />
    </AuthGuard>
  );
}
