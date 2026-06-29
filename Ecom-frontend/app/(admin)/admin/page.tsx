import { redirect } from "next/navigation";
import { paths } from "@root/path";

export default function AdminIndexPage() {
  redirect(paths.admin.dashboard);
}
