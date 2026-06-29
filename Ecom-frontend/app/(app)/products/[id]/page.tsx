import { redirect } from "next/navigation";
import { paths } from "@root/path";

// Product detail moved to /shop/[id].
export default async function LegacyProductRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(paths.products.view(id));
}
