import { Suspense } from "react";
import { StoreCatalog } from "@sections/store/store-catalog";

export default function ShopPage() {
  // StoreCatalog reads filter state from the URL (useSearchParams).
  return (
    <Suspense fallback={null}>
      <StoreCatalog />
    </Suspense>
  );
}
