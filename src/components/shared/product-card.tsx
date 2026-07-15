"use client";

import Link from "next/link";
import { Heart, Star, GitCompare, Eye, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductCardData } from "@/lib/constants/mock-data";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlist-slice";
import { addToCompare, removeFromCompare } from "@/store/slices/compare-slice";
import { addItem } from "@/store/slices/cart-slice";
import { toast } from "sonner";

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
  onQuickView?: (product: ProductCardData) => void;
}

export function ProductCard({ product, className, onQuickView }: ProductCardProps) {
  const dispatch = useAppDispatch();

  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const compareItems = useAppSelector((state) => state.compare.items);

  const isInWishlist = wishlistItems.includes(product.id);
  const isInCompare = compareItems.includes(product.id);

  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      )
    : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist(product.id));
      toast.success("Added to wishlist");
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare) {
      dispatch(removeFromCompare(product.id));
      toast.success("Removed from comparison");
    } else {
      dispatch(addToCompare(product.id));
      toast.success("Added to comparison");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) {
      toast.error("Product is out of stock");
      return;
    }
    dispatch(
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        quantity: 1,
      })
    );
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <article
      className={cn(
        "group product-card-hover relative flex flex-col overflow-hidden rounded-xl border border-white/8 bg-surface",
        className
      )}
    >
      {/* Image Area */}
      <div className="relative aspect-square overflow-hidden bg-surface-elevated">
        <Link href={`/shop/${product.slug}`} className="block h-full w-full">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-elevated to-surface">
            {product.image && product.image !== "/images/placeholder.jpg" ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan/20 to-blue/20">
                <span className="font-display text-2xl font-bold text-cyan/60">
                  {product.brand.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.badge && <Badge variant="default">{product.badge}</Badge>}
          {discount > 0 && <Badge variant="success">-{discount}%</Badge>}
          {product.condition && <Badge variant="outline">{product.condition}</Badge>}
        </div>

        {/* Action Buttons (visible on hover) */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg bg-surface/80 backdrop-blur-sm transition-colors hover:bg-cyan/20 hover:text-cyan cursor-pointer",
              isInWishlist && "text-cyan bg-cyan/20"
            )}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn("h-4 w-4", isInWishlist && "fill-cyan")} />
          </button>
          <button
            onClick={handleCompareToggle}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg bg-surface/80 backdrop-blur-sm transition-colors hover:bg-cyan/20 hover:text-cyan cursor-pointer",
              isInCompare && "text-cyan bg-cyan/20"
            )}
            aria-label="Toggle compare"
          >
            <GitCompare className="h-4 w-4" />
          </button>
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface/80 backdrop-blur-sm transition-colors hover:bg-cyan/20 hover:text-cyan cursor-pointer"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Add to Cart (slide up on hover) */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full p-3 transition-transform group-hover:translate-y-0">
          <Button
            className="w-full cursor-pointer"
            size="sm"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          {product.brand}
        </p>
        <Link
          href={`/shop/${product.slug}`}
          className="mt-1 line-clamp-2 font-medium text-foreground transition-colors hover:text-cyan"
        >
          {product.name}
        </Link>

        {product.rating !== undefined && product.rating > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.floor(product.rating!)
                      ? "fill-green text-green"
                      : "text-white/20"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted">({product.reviewCount || 0})</span>
          </div>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {!product.inStock && (
          <span className="mt-1 text-xs text-destructive">Out of Stock</span>
        )}
      </div>
    </article>
  );
}
