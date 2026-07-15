"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { removeFromWishlist, clearWishlist } from "@/store/slices/wishlist-slice";
import { addItem } from "@/store/slices/cart-slice";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  brand: string;
  category: string;
  image: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
}

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const wishlistIds = useAppSelector((state) => state.wishlist.items);

  // Fetch actual product data for wishlist items (mock using IDs from redux)
  const { data: allProducts } = useQuery<{ products: WishlistProduct[] }>({
    queryKey: ["products-wishlist"],
    queryFn: () =>
      fetch(`/api/products?limit=50`).then((res) => res.json()),
    enabled: wishlistIds.length > 0,
  });

  const wishlistProducts =
    allProducts?.products?.filter((p) => wishlistIds.includes(p.id)) || [];

  const handleRemove = (id: string, name: string) => {
    dispatch(removeFromWishlist(id));
    toast.success(`${name} removed from wishlist`);
  };

  const handleAddToCart = (product: WishlistProduct) => {
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

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">My Wishlist</h1>
          <p className="mt-1 text-sm text-muted">
            {wishlistIds.length} {wishlistIds.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        {wishlistIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted hover:text-destructive cursor-pointer"
            onClick={() => {
              dispatch(clearWishlist());
              toast.success("Wishlist cleared");
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {wishlistIds.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-white/8 bg-surface p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 mb-5">
            <Heart className="h-10 w-10 text-white/20" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground">Your Wishlist is Empty</h3>
          <p className="mt-2 max-w-sm text-muted">
            Start adding products you love to see them here.
          </p>
          <Button className="mt-6 cursor-pointer" asChild>
            <Link href="/shop">
              Browse Shop
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {wishlistProducts.length > 0 ? (
              wishlistProducts.map((product) => {
                const discount = product.compareAtPrice
                  ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                  : 0;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-white/8 bg-surface"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(product.id, product.name)}
                      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/70 text-muted backdrop-blur-sm transition-colors hover:bg-destructive/20 hover:text-destructive cursor-pointer"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Image */}
                    <Link href={`/shop/${product.slug}`} className="block">
                      <div className="relative aspect-square overflow-hidden bg-surface-elevated flex items-center justify-center">
                        {product.image && !product.image.includes("placeholder") ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan/20 to-blue/20">
                            <span className="font-display text-2xl font-bold text-cyan/40">
                              {product.brand.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                          {discount > 0 && <Badge variant="success">-{discount}%</Badge>}
                          {!product.inStock && <Badge variant="outline">Out of Stock</Badge>}
                        </div>
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{product.brand}</p>
                      <Link
                        href={`/shop/${product.slug}`}
                        className="mt-1 text-sm font-medium text-foreground transition-colors hover:text-cyan line-clamp-2"
                      >
                        {product.name}
                      </Link>

                      {product.rating > 0 && (
                        <div className="mt-1.5 flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn("h-3 w-3", i < Math.floor(product.rating) ? "fill-green text-green" : "text-white/20")}
                            />
                          ))}
                          <span className="text-xs text-muted ml-1">({product.reviewCount})</span>
                        </div>
                      )}

                      <div className="mt-auto pt-3 space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-foreground">{formatPrice(product.price)}</span>
                          {product.compareAtPrice && (
                            <span className="text-sm text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="w-full cursor-pointer"
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                        >
                          <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                          {product.inStock ? "Add to Cart" : "Out of Stock"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              // Show placeholders while loading API data for wishlist IDs
              Array.from({ length: wishlistIds.length }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-white/8 bg-surface overflow-hidden">
                  <div className="aspect-square bg-surface-elevated" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 w-16 rounded bg-surface-elevated" />
                    <div className="h-4 w-full rounded bg-surface-elevated" />
                    <div className="h-4 w-2/3 rounded bg-surface-elevated" />
                    <div className="h-8 rounded bg-surface-elevated mt-4" />
                  </div>
                </div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
