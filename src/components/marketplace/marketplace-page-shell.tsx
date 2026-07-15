import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  brand: string;
  category: string;
  condition?: string | null;
  shortDescription?: string | null;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  badge?: string;
  previewSpec?: string | null;
}

interface BenefitItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface MarketplacePageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  heroImage?: string | null;
  stats?: Array<{ label: string; value: string }>;
  benefits?: BenefitItem[];
  products: ProductSummary[];
  emptyMessage: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  productListTitle?: string;
}

export function MarketplacePageShell({
  eyebrow,
  title,
  description,
  heroImage,
  stats = [],
  benefits = [],
  products,
  emptyMessage,
  ctaLabel = "Explore collection",
  ctaHref = "/shop",
  secondaryCtaLabel,
  secondaryCtaHref,
  productListTitle = "Featured picks",
}: MarketplacePageShellProps) {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-surface via-surface to-surface-elevated shadow-[0_30px_80px_rgba(3,5,14,0.35)]">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
          <div className="flex flex-col justify-center">
            <Badge variant="outline" className="w-fit border-cyan/30 bg-cyan/10 text-cyan">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              {eyebrow}
            </Badge>
            <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="cursor-pointer">
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {secondaryCtaLabel && secondaryCtaHref ? (
                <Button variant="outline" asChild className="cursor-pointer">
                  <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-surface/70 p-5 backdrop-blur">
            <div className="grid gap-3 sm:grid-cols-2">
              {stats.length > 0 ? (
                stats.map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/8 bg-surface-elevated/70 p-4">
                    <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                    <p className="mt-1 text-sm text-muted">{item.label}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="rounded-xl border border-white/8 bg-surface-elevated/70 p-4">
                    <p className="text-2xl font-semibold text-foreground">24/7</p>
                    <p className="mt-1 text-sm text-muted">Expert support</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-surface-elevated/70 p-4">
                    <p className="text-2xl font-semibold text-foreground">India</p>
                    <p className="mt-1 text-sm text-muted">Fast shipping</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {benefits.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card key={benefit.title} className="border-white/10 bg-surface/70">
                <CardHeader className="pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-3 text-lg text-foreground">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-muted">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-surface/70 p-6 sm:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan">{productListTitle}</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Curated picks from our catalog</h2>
          </div>
          <Button variant="outline" asChild className="cursor-pointer">
            <Link href="/shop">Browse all products</Link>
          </Button>
        </div>

        {products.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-surface-elevated/70 transition-transform duration-200 hover:-translate-y-1 hover:border-cyan/30"
              >
                <div className="aspect-[4/3] overflow-hidden bg-surface">
                  {product.image && product.image !== "/images/placeholder.jpg" ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan/10 to-blue/10 text-3xl font-semibold text-cyan/70">
                      {product.brand.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/8 bg-surface px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted">
                      {product.category}
                    </span>
                    {product.condition ? (
                      <Badge variant="outline" className="border-cyan/20 text-cyan">
                        {product.condition}
                      </Badge>
                    ) : null}
                  </div>

                  <h3 className="mt-4 line-clamp-2 text-lg font-semibold text-foreground">{product.name}</h3>
                  <p className="mt-2 text-sm text-muted">
                    {product.shortDescription || `Premium ${product.name.toLowerCase()} from ${product.brand}.`}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-sm text-muted">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
                    </div>
                    <span>• {product.reviewCount} reviews</span>
                  </div>

                  {product.previewSpec ? (
                    <p className="mt-3 text-sm text-cyan">{product.previewSpec}</p>
                  ) : null}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{formatPrice(product.price)}</p>
                      {product.compareAtPrice && product.compareAtPrice > product.price ? (
                        <p className="text-sm text-muted line-through">{formatPrice(product.compareAtPrice)}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right">
                      <span className="text-sm font-medium text-foreground">
                        {product.inStock ? "In stock" : "Out of stock"}
                      </span>
                      <span className="text-xs text-muted">{product.badge || "Verified listing"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-surface/60 p-8 text-center text-sm text-muted">
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  );
}
