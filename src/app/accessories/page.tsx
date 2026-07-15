import { Headphones, Keyboard, Monitor } from "lucide-react";
import { MarketplacePageShell } from "@/components/marketplace/marketplace-page-shell";
import { getCatalogCollectionData } from "@/lib/catalog";

export default async function AccessoriesPage() {
  const { category, products } = await getCatalogCollectionData("accessories", 6);

  return (
    <MarketplacePageShell
      eyebrow="Premium peripherals"
      title={category.name}
      description={category.description || "Upgrade your setup with keyboards, mice, headsets, monitors, and performance-focused gear."}
      stats={[
        { label: "Peripheral range", value: "100+ SKUs" },
        { label: "RGB ready", value: "Premium picks" },
        { label: "Ideal for", value: "Streaming & FPS" },
        { label: "Support", value: "Live assistance" },
      ]}
      benefits={[
        {
          title: "Precision controls",
          description: "Find the perfect keyboard and mouse combo for fast reaction times and cleaner setups.",
          icon: Keyboard,
        },
        {
          title: "Immersive audio",
          description: "Get crystal-clear headsets tuned for competitive play and everyday entertainment.",
          icon: Headphones,
        },
        {
          title: "Visual clarity",
          description: "Upgrade to better displays and monitor accessories that sharpen every session.",
          icon: Monitor,
        },
      ]}
      products={products}
      emptyMessage="Accessory listings will appear here once the catalog is populated."
      ctaLabel="Shop accessories"
      ctaHref="/shop?category=accessories"
      secondaryCtaLabel="Build your PC"
      secondaryCtaHref="/pc-builder"
      productListTitle="Featured accessory picks"
    />
  );
}
