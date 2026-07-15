"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, ChevronDown, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface AdminHeaderProps {
  username: string;
}

export function AdminHeader({ username }: AdminHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      toast.success("Logged out");
      router.push("/admin-login");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-white/8 bg-surface px-4 lg:px-8 py-3 shrink-0">
      {/* Left: breadcrumb placeholder / page title injected per-page */}
      <div className="text-sm text-muted hidden lg:block">
        <span className="text-foreground font-medium">RigNova</span>
        <span className="mx-2 text-white/20">/</span>
        <span>Admin</span>
      </div>

      {/* Right: user menu */}
      <div className="ml-auto relative">
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-surface-elevated px-3 py-2 text-sm font-medium hover:border-white/15 transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-blue text-background text-xs font-bold">
            {username.slice(0, 1).toUpperCase()}
          </div>
          <span className="hidden sm:block">{username}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-muted transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setDropdownOpen(false)}
            />
            {/* Menu */}
            <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-xl border border-white/8 bg-surface shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-xs text-muted">Signed in as</p>
                <p className="text-sm font-semibold truncate">{username}</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Store
                </Link>
                <div className="border-t border-white/8 my-1" />
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
