import { ArrowRight, BadgeCheck, PackageOpen, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCatalogCollectionData } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

export default async function SellGPUPage() {
  const { category, products } = await getCatalogCollectionData("used-gpus", 4);

  const steps = [
    {
      title: "Share your GPU details",
      description: "Tell us the model, condition, and any accessories included.",
    },
    {
      title: "Get a competitive quote",
      description: "We evaluate market pricing and offer a fair trade-in or buyback value.",
    },
    {
      title: "Ship or drop off",
      description: "Choose pickup, courier, or a secure drop-off at our partner location.",
    },
  ];

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-surface via-surface to-surface-elevated p-8 sm:p-10">
        <Badge variant="outline" className="border-cyan/30 bg-cyan/10 text-cyan">
          <BadgeCheck className="mr-2 h-3.5 w-3.5" />
          Sell your GPU safely
        </Badge>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              Turn your used GPU into instant value
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              {category.description || "From RTX 40-series to older flagship cards, we help you get the best resale value with transparent pricing and fast collection."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="cursor-pointer">
                <Link href="/contact">
                  Request a quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="cursor-pointer">
                <Link href="/used-gpus">Browse used GPUs</Link>
              </Button>
            </div>
          </div>

          <Card className="border-white/10 bg-surface/70">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Why sellers choose RigNova</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-surface-elevated/70 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan" />
                <div>
                  <p className="font-semibold text-foreground">Trusted evaluations</p>
                  <p className="mt-1 text-sm text-muted">We assess your card fairly based on condition, market demand, and age.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-surface-elevated/70 p-4">
                <PackageOpen className="mt-0.5 h-5 w-5 text-cyan" />
                <div>
                  <p className="font-semibold text-foreground">Fast pickup</p>
                  <p className="mt-1 text-sm text-muted">Secure collection and quick payment options for verified sellers.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step.title} className="border-white/10 bg-surface/70">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan/10 text-sm font-semibold text-cyan">
                0{index + 1}
              </div>
              <CardTitle className="mt-3 text-lg text-foreground">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-muted">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-surface/70 p-6 sm:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan">Current listings</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Recently added {category.name.toLowerCase()} from the live catalog</h2>
          </div>
          <Button variant="outline" asChild className="cursor-pointer">
            <Link href="/used-gpus">View all used GPUs</Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} href={`/shop/${product.slug}`} className="overflow-hidden rounded-2xl border border-white/10 bg-surface-elevated/70 transition-transform duration-200 hover:-translate-y-1">
              <div className="aspect-[4/3] overflow-hidden bg-surface">
                {product.image && product.image !== "/images/placeholder.jpg" ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan/10 to-blue/10 text-xl font-semibold text-cyan/70">
                    {product.brand.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{product.name}</h3>
                <p className="mt-2 text-sm text-muted">{product.shortDescription || product.brand}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-semibold text-foreground">{formatPrice(product.price)}</p>
                  <span className="text-sm font-medium text-cyan">{product.inStock ? "In stock" : "Out of stock"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
