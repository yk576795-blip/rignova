import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { Providers } from "@/components/providers";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: {
    default: "Admin — RigNova",
    template: "%s | Admin — RigNova",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Proxy (middleware) already handles unauthenticated redirects.
  // We only read the session here to get the username for the header.
  const session = await getAdminSession();

  return (
    <Providers>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <AdminHeader username={session.username || "Admin"} />
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
