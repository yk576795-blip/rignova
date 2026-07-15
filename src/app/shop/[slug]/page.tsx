"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  GitCompare,
  Share2,
  Shield,
  Truck,
  Package,
  Star,
  ChevronRight,
  BadgeCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductSpecs } from "@/components/product/product-specs";
import { ProductBenchmarks } from "@/components/product/product-benchmarks";
import { ProductReviews } from "@/components/product/product-reviews";
import { formatPrice, cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { addItem } from "@/store/slices/cart-slice";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlist-slice";
import { addToCompare, removeFromCompare } from "@/store/slices/compare-slice";
import { toast } from "sonner";
import { useState } from "react";

interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  inStock: boolean;
  condition: string;
  hasRgb: boolean;
  warrantyMonths: number;
  brand: { id: string; name: string; slug: string; logo: string | null };
  category: { id: string; name: string; slug: string };
  images: { id: string; url: string; alt: string | null; isPrimary: boolean }[];
  specs: { id: string; group: string; key: string; value: string }[];
  benchmarks: { id: string; game: string; resolution: string; fps: number; settings: string }[];
  reviews: {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    isVerified: boolean;
    createdAt: string;
    user: { name: string; image: string | null };
  }[];
  usedGpuDetails: {
    grade: string;
    stressTestScore: number | null;
    benchmarkScore: number | null;
    verified: boolean;
    sellerNotes: string | null;
  } | null;
  rating: number;
  reviewCount: number;
  ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  metaTitle: string | null;
  metaDescription: string | null;
}

function ProductDetailClient({ slug }: { slug: string }) {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const compareItems = useAppSelector((state) => state.compare.items);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery<ProductDetailData>({
    queryKey: ["product", slug],
    queryFn: () =>
      fetch(`/api/products/${slug}`).then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      }),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-surface-elevated" />
          <div className="space-y-4">
            <div className="h-6 w-24 animate-pulse rounded bg-surface-elevated" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-surface-elevated" />
            <div className="h-4 w-full animate-pulse rounded bg-surface-elevated" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-elevated" />
            <div className="h-16 animate-pulse rounded bg-surface-elevated" />
            <div className="h-12 animate-pulse rounded bg-surface-elevated" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Product Not Found</h1>
        <p className="mt-2 text-muted">This product may no longer be available.</p>
        <Button className="mt-6" asChild>
          <Link href="/shop">Browse Shop</Link>
        </Button>
      </div>
    );
  }

  const isInWishlist = wishlistItems.includes(product.id);
  const isInCompare = compareItems.includes(product.id);
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product.inStock) { toast.error("Out of stock"); return; }
    dispatch(addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0]?.url || "",
      quantity,
    }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist(product.id));
      toast.success("Added to wishlist");
    }
  };

  const handleCompare = () => {
    if (isInCompare) {
      dispatch(removeFromCompare(product.id));
      toast.success("Removed from comparison");
    } else {
      dispatch(addToCompare(product.id));
      toast.success("Added to comparison");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-foreground transition-colors">
          {product.category.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate max-w-[180px]">{product.name}</span>
      </nav>

      {/* Main Product Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 gap-10 lg:grid-cols-2"
      >
        {/* Left: Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Right: Product Info */}
        <div className="flex flex-col gap-5">
          {/* Brand & Category */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/shop?brand=${product.brand.slug}`}
              className="text-sm font-bold uppercase tracking-wider text-cyan hover:underline"
            >
              {product.brand.name}
            </Link>
            <span className="text-muted/40">·</span>
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              {product.category.name}
            </Link>
            {product.usedGpuDetails && (
              <Badge variant="outline" className="ml-auto">
                Grade {product.usedGpuDetails.grade}
              </Badge>
            )}
          </div>

          {/* Name */}
          <h1 className="font-display text-3xl font-extrabold text-foreground leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn("h-4 w-4", i < Math.floor(product.rating) ? "fill-green text-green" : "text-white/20")}
                  />
                ))}
              </div>
              <span className="text-sm text-muted">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-muted leading-relaxed text-sm">{product.shortDescription}</p>
          )}

          <Separator />

          {/* Pricing */}
          <div className="flex items-baseline gap-4">
            <span className="font-display text-4xl font-extrabold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-muted line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <Badge variant="success" className="text-base px-3 py-1">
                  Save {discount}%
                </Badge>
              </>
            )}
          </div>

          {/* Stock & Condition */}
          <div className="flex flex-wrap gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                product.inStock
                  ? "bg-green/15 text-green"
                  : "bg-destructive/15 text-destructive"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", product.inStock ? "bg-green" : "bg-destructive")} />
              {product.inStock ? `In Stock (${product.stock} units)` : "Out of Stock"}
            </span>
            {product.condition !== "NEW" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-muted">
                {product.condition.replace("_", " ")}
              </span>
            )}
            {product.hasRgb && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan">
                <Zap className="h-3 w-3" />
                RGB
              </span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center overflow-hidden rounded-lg border border-white/10">
                <button
                  className="flex h-11 w-10 items-center justify-center text-muted transition-colors hover:bg-white/5 hover:text-foreground cursor-pointer"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="flex h-11 w-12 items-center justify-center border-x border-white/10 text-sm font-semibold text-foreground">
                  {quantity}
                </span>
                <button
                  className="flex h-11 w-10 items-center justify-center text-muted transition-colors hover:bg-white/5 hover:text-foreground cursor-pointer"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <Button
                className="flex-1 cursor-pointer"
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleWishlist}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  isInWishlist ? "border-cyan/30 bg-cyan/10 text-cyan" : "text-muted hover:border-white/30 hover:text-foreground"
                )}
              >
                <Heart className={cn("h-4 w-4", isInWishlist && "fill-cyan")} />
                {isInWishlist ? "Wishlisted" : "Wishlist"}
              </button>
              <button
                onClick={handleCompare}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  isInCompare ? "border-blue/30 bg-blue/10 text-blue" : "text-muted hover:border-white/30 hover:text-foreground"
                )}
              >
                <GitCompare className="h-4 w-4" />
                Compare
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-white/30 hover:text-foreground cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/8 bg-surface p-4">
            {[
              { Icon: Shield, title: `${product.warrantyMonths}M Warranty`, desc: "Manufacturer backed" },
              { Icon: Truck, title: "Free Delivery", desc: "On orders above ₹10,000" },
              { Icon: Package, title: "Easy Returns", desc: "7-day hassle-free" },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-1 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan/10">
                  <Icon className="h-4 w-4 text-cyan" />
                </div>
                <span className="text-xs font-semibold text-foreground">{title}</span>
                <span className="text-[10px] text-muted">{desc}</span>
              </div>
            ))}
          </div>

          {/* Used GPU specific info */}
          {product.usedGpuDetails && (
            <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-cyan" />
                <span className="font-semibold text-sm text-foreground">RigNova Verified Used GPU</span>
              </div>
              {product.usedGpuDetails.stressTestScore && (
                <p className="text-xs text-muted">Stress Test: <span className="font-semibold text-green">{product.usedGpuDetails.stressTestScore}/100</span></p>
              )}
              {product.usedGpuDetails.sellerNotes && (
                <p className="text-xs text-muted italic">{product.usedGpuDetails.sellerNotes}</p>
              )}
            </div>
          )}

          {/* SKU */}
          <p className="text-xs text-muted">SKU: <span className="font-mono">{product.sku}</span></p>
        </div>
      </motion.div>

      {/* Tabs: Specs, Benchmarks, Reviews */}
      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b border-white/8 rounded-none bg-transparent p-0 gap-1 mb-8 h-auto">
            {[
              { value: "description", label: "Description" },
              { value: "specs", label: "Specifications" },
              { value: "benchmarks", label: "Benchmarks & FPS" },
              { value: "reviews", label: `Reviews (${product.reviewCount})` },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent pb-3 pt-1 px-4 text-sm font-medium text-muted data-[state=active]:border-cyan data-[state=active]:text-foreground data-[state=active]:bg-transparent transition-all cursor-pointer"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="description">
            <div className="prose prose-invert max-w-none text-muted leading-relaxed">
              <p>{product.description}</p>
            </div>
          </TabsContent>

          <TabsContent value="specs">
            <ProductSpecs specs={product.specs} />
          </TabsContent>

          <TabsContent value="benchmarks">
            <ProductBenchmarks benchmarks={product.benchmarks} productName={product.name} />
          </TabsContent>

          <TabsContent value="reviews">
            <ProductReviews
              reviews={product.reviews}
              avgRating={product.rating}
              reviewCount={product.reviewCount}
              ratingDistribution={product.ratingDistribution}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  return <ProductDetailClient slug={slug} />;
}
