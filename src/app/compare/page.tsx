"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { GitCompare, Trash2, ShoppingCart, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { removeFromCompare, clearCompare } from "@/store/slices/compare-slice";
import { addItem } from "@/store/slices/cart-slice";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";

interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  image: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  condition: string;
  warrantyMonths?: number;
  hasRgb?: boolean;
  stock?: number;
}

export default function ComparePage() {
  const dispatch = useAppDispatch();
  const compareIds = useAppSelector((state) => state.compare.items);

  const { data: allProducts } = useQuery<{ products: CompareProduct[] }>({
    queryKey: ["products-compare"],
    queryFn: () =>
      fetch(`/api/products?limit=50`).then((res) => res.json()),
    enabled: compareIds.length > 0,
  });

  const compareProducts =
    allProducts?.products?.filter((p) => compareIds.includes(p.id)) || [];

  const handleRemove = (id: string) => {
    dispatch(removeFromCompare(id));
    toast.success("Removed from comparison");
  };

  const handleAddToCart = (product: CompareProduct) => {
    if (!product.inStock) { toast.error("Product out of stock"); return; }
    dispatch(addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      quantity: 1,
    }));
    toast.success(`${product.name} added to cart!`);
  };

  // Fields to compare
  const compareFields: { label: string; key: keyof CompareProduct }[] = [
    { label: "Brand", key: "brand" },
    { label: "Category", key: "category" },
    { label: "Condition", key: "condition" },
    { label: "Availability", key: "inStock" },
    { label: "Rating", key: "rating" },
    { label: "Warranty", key: "warrantyMonths" },
    { label: "RGB", key: "hasRgb" },
  ];

  const renderFieldValue = (key: keyof CompareProduct, value: unknown) => {
    if (key === "inStock") return value ? <span className="text-green font-medium">In Stock</span> : <span className="text-destructive font-medium">Out of Stock</span>;
    if (key === "hasRgb") return value ? <span className="text-cyan font-medium">✓ Yes</span> : <span className="text-muted">No</span>;
    if (key === "warrantyMonths") return value ? `${value} Months` : "–";
    if (key === "rating") return (value as number) > 0 ? `${(value as number).toFixed(1)} / 5` : "–";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value ?? "–");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">Compare Products</h1>
          <p className="mt-1 text-sm text-muted">
            Comparing {compareIds.length} {compareIds.length === 1 ? "product" : "products"} (max 4)
          </p>
        </div>
        {compareIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted hover:text-destructive cursor-pointer"
            onClick={() => {
              dispatch(clearCompare());
              toast.success("Compare list cleared");
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {compareIds.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-white/8 bg-surface p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 mb-5">
            <GitCompare className="h-10 w-10 text-white/20" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground">Nothing to Compare</h3>
          <p className="mt-2 max-w-sm text-muted">
            Browse products and click the compare icon to add them here.
          </p>
          <Button className="mt-6 cursor-pointer" asChild>
            <Link href="/shop">
              Browse Shop
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Product Cards Row */}
            <div
              className="grid gap-4 mb-6"
              style={{ gridTemplateColumns: `200px repeat(${Math.max(compareProducts.length, compareIds.length)}, 1fr)` }}
            >
              <div className="flex items-end pb-4">
                <span className="text-sm font-semibold text-muted uppercase tracking-wider">Products</span>
              </div>

              {compareIds.length > compareProducts.length
                ? // Loading placeholders
                  compareIds.map((id) => (
                    <div key={id} className="animate-pulse rounded-xl border border-white/8 bg-surface p-4 space-y-3">
                      <div className="aspect-square rounded-lg bg-surface-elevated" />
                      <div className="h-4 w-3/4 rounded bg-surface-elevated" />
                      <div className="h-6 w-1/2 rounded bg-surface-elevated" />
                    </div>
                  ))
                : compareProducts.map((product) => {
                    const discount = product.compareAtPrice
                      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                      : 0;
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative rounded-xl border border-white/10 bg-surface p-4 flex flex-col gap-3"
                      >
                        <button
                          onClick={() => handleRemove(product.id)}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/8 text-muted transition-colors hover:bg-destructive/20 hover:text-destructive cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>

                        <Link href={`/shop/${product.slug}`} className="block">
                          <div className="aspect-square overflow-hidden rounded-lg bg-surface-elevated flex items-center justify-center">
                            {product.image && !product.image.includes("placeholder") ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-cyan/20 to-blue/20">
                                <span className="font-display text-xl font-bold text-cyan/40">
                                  {product.brand.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{product.brand}</p>
                          <Link
                            href={`/shop/${product.slug}`}
                            className="mt-0.5 text-sm font-semibold text-foreground line-clamp-2 hover:text-cyan transition-colors"
                          >
                            {product.name}
                          </Link>
                        </div>

                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-bold text-foreground">{formatPrice(product.price)}</span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
                          )}
                          {discount > 0 && <Badge variant="success" className="text-xs">-{discount}%</Badge>}
                        </div>

                        <Button
                          size="sm"
                          className="w-full cursor-pointer"
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                        >
                          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                          {product.inStock ? "Add to Cart" : "Out of Stock"}
                        </Button>
                      </motion.div>
                    );
                  })}
            </div>

            {/* Comparison Rows */}
            {compareProducts.length > 0 && (
              <div className="rounded-xl border border-white/8 overflow-hidden">
                <div
                  className="grid border-b border-white/8 bg-white/3 px-4 py-3"
                  style={{ gridTemplateColumns: `200px repeat(${compareProducts.length}, 1fr)` }}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Specification</span>
                  {compareProducts.map((p) => (
                    <span key={p.id} className="text-xs font-bold uppercase tracking-wider text-cyan text-center">
                      {p.brand}
                    </span>
                  ))}
                </div>

                {compareFields.map((field, i) => (
                  <div
                    key={field.key}
                    className={cn(
                      "grid px-4 py-3 border-b border-white/5",
                      i % 2 === 0 ? "" : "bg-white/1"
                    )}
                    style={{ gridTemplateColumns: `200px repeat(${compareProducts.length}, 1fr)` }}
                  >
                    <span className="text-sm text-muted">{field.label}</span>
                    {compareProducts.map((product) => (
                      <div key={product.id} className="text-center text-sm font-medium text-foreground">
                        {renderFieldValue(field.key, product[field.key])}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Price row */}
                <div
                  className="grid px-4 py-4 bg-white/3"
                  style={{ gridTemplateColumns: `200px repeat(${compareProducts.length}, 1fr)` }}
                >
                  <span className="text-sm font-semibold text-muted">Price</span>
                  {compareProducts.map((product) => (
                    <div key={product.id} className="text-center">
                      <span className="font-bold text-cyan text-lg">{formatPrice(product.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
