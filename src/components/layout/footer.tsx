"use client";

import Link from "next/link";
import {
  Heart,
  Share2,
  Play,
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FOOTER_LINKS } from "@/lib/constants/navigation";
import { BRAND } from "@/lib/constants/brand";

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {BRAND.description} Premium gaming hardware, custom builds, and
              certified used GPUs — delivered across India.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { icon: Heart, href: BRAND.social.instagram, label: "Instagram" },
                { icon: Share2, href: BRAND.social.twitter, label: "Twitter" },
                { icon: Play, href: BRAND.social.youtube, label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-muted transition-colors hover:border-cyan/30 hover:text-cyan"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Shop
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-cyan"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Support
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-cyan"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-cyan"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 grid gap-8 border-t border-white/8 pt-12 md:grid-cols-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Stay in the loop
            </h3>
            <p className="mt-2 text-sm text-muted">
              Get exclusive deals, new product launches, and build guides.
            </p>
            <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                aria-label="Email for newsletter"
              />
              <Button type="submit" size="icon" aria-label="Subscribe">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted">
              <Mail className="h-4 w-4 shrink-0 text-cyan" />
              <a href={`mailto:${BRAND.email}`} className="hover:text-foreground">
                {BRAND.email}
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <Phone className="h-4 w-4 shrink-0 text-cyan" />
              <a href={`tel:${BRAND.phone}`} className="hover:text-foreground">
                {BRAND.phone}
              </a>
            </div>
            <div className="flex items-start gap-3 text-sm text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
              <span>{BRAND.address}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/refund-policy" className="hover:text-foreground">
              Refunds
            </Link>
            <Link
              href="/admin"
              className="hover:text-cyan transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
