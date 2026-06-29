import { redirect } from "next/navigation";
import { paths } from "@root/path";

// Storefront catalog moved to /shop.
export default function LegacyProductsRedirect() {
  redirect(paths.products.base);
}
