"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import type { ProductCardData } from "@/lib/constants/mock-data";

interface ProductGridSectionProps {
  subtitle: string;
  title: string;
  description?: string;
  products: ProductCardData[];
  viewAllHref: string;
}

export function ProductGridSection({
  subtitle,
  title,
  description,
  products,
  viewAllHref,
}: ProductGridSectionProps) {
  // Don't render the section at all if no products
  if (!products || products.length === 0) return null;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeader
            subtitle={subtitle}
            title={title}
            description={description}
            align="left"
            className="mb-0"
          />
          <Button variant="ghost" asChild className="shrink-0">
            <Link href={viewAllHref}>
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
