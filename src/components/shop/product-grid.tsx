"use client";

import { ProductCard } from "@/components/shared/product-card";
import type { ProductCardData } from "@/lib/constants/mock-data";
import { Loader2 } from "lucide-react";

interface ProductGridProps {
  products: ProductCardData[];
  isLoading: boolean;
  onQuickView: (product: ProductCardData) => void;
}

export function ProductGrid({ products, isLoading, onQuickView }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-cyan" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-white/8 bg-surface p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-muted mb-4">
          🔍
        </div>
        <h4 className="font-display text-lg font-bold text-foreground">No Products Found</h4>
        <p className="mt-1 text-sm text-muted max-w-sm">
          We couldn't find any products matching your filters. Try adjusting your price range, choosing different categories, or clearing search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
}
