import { redirect } from "next/navigation";

// Permanent redirect — old /admin/login → new /admin-login
export default function OldAdminLoginRedirect() {
  redirect("/admin-login");
}
