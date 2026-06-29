import { redirect } from "next/navigation";
import { paths } from "@root/path";

// Product editing moved to the guarded admin area.
export default async function LegacyEditRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(paths.admin.editProduct(id));
}
