"use client";

import { SectionHeader } from "@/components/shared/section-header";
import { BRAND_LOGOS } from "@/lib/constants/mock-data";

export function BrandLogos() {
  return (
    <section className="border-y border-white/8 bg-surface/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-muted">
          Authorized Partner of Leading Brands
        </p>
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee gap-16">
            {[...BRAND_LOGOS, ...BRAND_LOGOS].map((brand, i) => (
              <div
                key={`${brand.name}-${i}`}
                className="flex h-12 shrink-0 items-center justify-center px-8"
              >
                <span className="font-display text-lg font-bold text-white/30 transition-colors hover:text-white/60">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
