"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart, GitCompare, ArrowRight } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductCardData } from "@/lib/constants/mock-data";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlist-slice";
import { addToCompare, removeFromCompare } from "@/store/slices/compare-slice";
import { addItem } from "@/store/slices/cart-slice";
import { toast } from "sonner";
import Link from "next/link";

interface QuickViewModalProps {
  product: ProductCardData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const compareItems = useAppSelector((state) => state.compare.items);

  if (!product) return null;

  const isInWishlist = wishlistItems.includes(product.id);
  const isInCompare = compareItems.includes(product.id);

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist(product.id));
      toast.success("Added to wishlist");
    }
  };

  const handleCompareToggle = () => {
    if (isInCompare) {
      dispatch(removeFromCompare(product.id));
      toast.success("Removed from comparison");
    } else {
      dispatch(addToCompare(product.id));
      toast.success("Added to comparison");
    }
  };

  const handleAddToCart = () => {
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl border-white/10 bg-surface text-foreground md:p-8">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Quick view details for {product.name}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-xl border border-white/8 bg-surface-elevated flex items-center justify-center">
            {product.image && product.image !== "/images/placeholder.jpg" ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan/20 to-blue/20">
                <span className="font-display text-4xl font-bold text-cyan/60">
                  {product.brand.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {product.badge && <Badge variant="default">{product.badge}</Badge>}
              {discount > 0 && <Badge variant="success">-{discount}%</Badge>}
              {product.condition && <Badge variant="outline">{product.condition}</Badge>}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-cyan">
                {product.brand}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                {product.name}
              </h2>

              {/* Rating */}
              {product.rating !== undefined && product.rating > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(product.rating!)
                            ? "fill-green text-green"
                            : "text-white/20"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted">
                    {product.rating} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3 border-b border-white/10 pb-4">
                <span className="text-3xl font-extrabold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-lg text-muted line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 space-y-2.5 text-sm text-muted">
                <div className="flex justify-between">
                  <span>Category</span>
                  <span className="font-medium text-foreground">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Availability</span>
                  <span
                    className={cn(
                      "font-medium",
                      product.inStock ? "text-green" : "text-destructive"
                    )}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Warranty</span>
                  <span className="font-medium text-foreground">12 Months</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <div className="flex gap-2">
                <Button className="flex-1 cursor-pointer" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <button
                  onClick={handleWishlistToggle}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-surface-elevated text-muted transition-colors hover:border-cyan/30 hover:text-cyan cursor-pointer",
                    isInWishlist && "border-cyan/30 text-cyan bg-cyan/10"
                  )}
                  aria-label="Wishlist"
                >
                  <Heart className={cn("h-5 w-5", isInWishlist && "fill-cyan")} />
                </button>
                <button
                  onClick={handleCompareToggle}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-surface-elevated text-muted transition-colors hover:border-cyan/30 hover:text-cyan cursor-pointer",
                    isInCompare && "border-cyan/30 text-cyan bg-cyan/10"
                  )}
                  aria-label="Compare"
                >
                  <GitCompare className="h-5 w-5" />
                </button>
              </div>

              <Button variant="outline" className="w-full cursor-pointer" asChild onClick={onClose}>
                <Link href={`/shop/${product.slug}`}>
                  View Full Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
