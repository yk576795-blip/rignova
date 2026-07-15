import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { MarketplacePageShell } from "@/components/marketplace/marketplace-page-shell";
import { getCatalogCollectionData } from "@/lib/catalog";

export default async function UsedGPUsPage() {
  const { category, products } = await getCatalogCollectionData("used-gpus", 6);

  return (
    <MarketplacePageShell
      eyebrow="Certified used GPUs"
      title={category.name}
      description={category.description || "Browse performance-verified graphics cards that bring premium gaming power to a smarter budget."}
      heroImage={category.image}
      stats={[
        { label: "Warranty-backed", value: "6-12 months" },
        { label: "Average savings", value: "Up to 35%" },
        { label: "Condition options", value: "Excellent / Good" },
        { label: "Fast dispatch", value: "24-48 hrs" },
      ]}
      benefits={[
        {
          title: "Quality checked",
          description: "Every unit is inspected, stress-tested, and matched with a clear condition grade.",
          icon: ShieldCheck,
        },
        {
          title: "Best value",
          description: "Unlock flagship performance with trade-in friendly pricing and smart savings.",
          icon: TrendingUp,
        },
        {
          title: "Ready for battle",
          description: "Ideal for 1440p, 4K, and immersive streaming rigs without overspending.",
          icon: Sparkles,
        },
      ]}
      products={products}
      emptyMessage="Used GPU listings will appear here once the catalog is populated."
      ctaLabel="Shop used GPUs"
      ctaHref="/shop?category=used-gpus"
      secondaryCtaLabel="Sell your GPU"
      secondaryCtaHref="/sell-gpu"
      productListTitle="Featured used GPU listings"
    />
  );
}
