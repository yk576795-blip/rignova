// This layout overrides the parent /admin/layout.tsx for the /admin/login route.
// It renders children directly without any auth check or sidebar.
export default function AdminLoginCompatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
