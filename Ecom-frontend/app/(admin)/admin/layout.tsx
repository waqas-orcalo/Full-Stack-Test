"use client";

import type { ReactNode } from "react";
import { AdminGuard } from "@root/guards";
import { DashboardLayout } from "@layouts/dashboard";

/**
 * Admin area — restricted to authenticated admin users. Wraps every /admin/*
 * page in the admin shell (sidebar + top bar).
 */
export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AdminGuard>
  );
}
