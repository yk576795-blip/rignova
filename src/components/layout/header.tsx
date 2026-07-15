"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  GitCompare,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAIN_NAV } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/use-redux";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);
  const compareCount = useAppSelector((state) => state.compare.items.length);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-strong border-b border-white/8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo size="sm" />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/wishlist"
              className="relative hidden h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green text-[10px] font-bold text-background">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/compare"
              className="relative hidden h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground sm:flex"
              aria-label="Compare"
            >
              <GitCompare className="h-5 w-5" />
              {compareCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue text-[10px] font-bold text-background">
                  {compareCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan text-[10px] font-bold text-background">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/login"
              className="hidden h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground md:flex"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>

            <Button size="sm" className="hidden md:inline-flex" asChild>
              <Link href="/pc-builder">Build Your PC</Link>
            </Button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted lg:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/8"
            >
              <div className="mx-auto max-w-2xl px-4 py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input
                    placeholder="Search GPUs, CPUs, gaming PCs..."
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-strong border-b border-white/8 lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
              {MAIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <Button className="mt-2" asChild>
                <Link href="/pc-builder" onClick={() => setMobileOpen(false)}>
                  Build Your PC
                </Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
