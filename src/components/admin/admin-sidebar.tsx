"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Grid3X3,
  BarChart3,
  Settings,
  ChevronLeft,
  Menu,
  ExternalLink,
  Box,
  Monitor,
  Gamepad2,
  Mouse,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "PC Builder",
    href: "/admin/pc-builder",
    icon: Box,
  },
  {
    label: "Used GPUs",
    href: "/admin/used-gpus",
    icon: Monitor,
  },
  {
    label: "Consoles",
    href: "/admin/consoles",
    icon: Gamepad2,
  },
  {
    label: "Accessories",
    href: "/admin/accessories",
    icon: Mouse,
  },
  {
    label: "Trade-ins",
    href: "/admin/sell-gpu",
    icon: DollarSign,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Brands",
    href: "/admin/brands",
    icon: Tag,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Grid3X3,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 border-r border-white/8 bg-surface transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-5 border-b border-white/8",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan to-blue">
            <Box className="h-4 w-4 text-background" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-display text-sm font-bold text-foreground">RigNova</p>
              <p className="text-xs text-muted">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-cyan/10 text-cyan"
                    : "text-muted hover:bg-white/5 hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", active && "text-cyan")} />
                {!collapsed && <span>{item.label}</span>}
                {active && !collapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/8 p-2 space-y-1">
          <Link
            href="/"
            target="_blank"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-foreground transition-all",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "View Store" : undefined}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {!collapsed && <span>View Store</span>}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-foreground transition-all",
              collapsed && "justify-center px-0"
            )}
          >
            <ChevronLeft
              className={cn("h-4 w-4 shrink-0 transition-transform", collapsed && "rotate-180")}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <MobileNav pathname={pathname} />
    </>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/8 bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan to-blue">
            <Box className="h-3.5 w-3.5 text-background" />
          </div>
          <span className="font-display text-sm font-bold">Admin</span>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-foreground"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav className="relative z-10 flex w-64 flex-col border-r border-white/8 bg-surface py-4 px-2 space-y-1">
            <div className="flex items-center gap-3 px-3 pb-4 mb-2 border-b border-white/8">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan to-blue">
                <Box className="h-4 w-4 text-background" />
              </div>
              <div>
                <p className="font-display text-sm font-bold">RigNova</p>
                <p className="text-xs text-muted">Admin Panel</p>
              </div>
            </div>
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-cyan/10 text-cyan"
                      : "text-muted hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="mt-auto pt-4 border-t border-white/8">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                <span>View Store</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
