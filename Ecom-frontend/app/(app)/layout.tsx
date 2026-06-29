import type { ReactNode } from "react";
import { StoreLayout } from "@layouts/store";

/**
 * Public storefront group. Browsing is open to everyone; auth is enforced only
 * on purchase actions and on the separate /admin area.
 */
export default function StoreGroupLayout({ children }: { children: ReactNode }) {
  return <StoreLayout>{children}</StoreLayout>;
}
