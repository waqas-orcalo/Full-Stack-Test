import { redirect } from "next/navigation";
import { paths } from "@root/path";

// Product creation moved to the guarded admin area.
export default function LegacyCreateRedirect() {
  redirect(paths.admin.createProduct);
}
