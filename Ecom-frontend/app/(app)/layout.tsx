import type { ReactNode } from "react";
import { DashboardLayout } from "@layouts/dashboard";

/**
 * Route-group layout: every page under app/(app) is wrapped in the
 * dashboard shell (sidebar + top bar). Mirrors COSMONYX-FE-001 app/(app).
 */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
