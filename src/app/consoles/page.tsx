import { Gamepad2, Headphones, ShieldCheck } from "lucide-react";
import { MarketplacePageShell } from "@/components/marketplace/marketplace-page-shell";
import { getCatalogCollectionData } from "@/lib/catalog";

export default async function ConsolesPage() {
  const { category, products } = await getCatalogCollectionData("consoles", 6);

  return (
    <MarketplacePageShell
      eyebrow="Console gaming"
      title={category.name}
      description={category.description || "Explore immersive console experiences with accessories, accessories bundles, and unbeatable launch-ready setups."}
      heroImage={category.image}
      stats={[
        { label: "Popular brands", value: "Sony & more" },
        { label: "Bundle ready", value: "Controllers + headsets" },
        { label: "Fast delivery", value: "2-4 days" },
        { label: "Secure checkout", value: "100% safe" },
      ]}
      benefits={[
        {
          title: "Launch-ready setups",
          description: "Pick a console and pair it with the right accessories for the ultimate play session.",
          icon: Gamepad2,
        },
        {
          title: "Comfort upgrades",
          description: "Find premium headsets, charging docks, and ergonomic add-ons for longer sessions.",
          icon: Headphones,
        },
        {
          title: "Warranty peace of mind",
          description: "Shop with secure purchases and support on every console and accessory bundle.",
          icon: ShieldCheck,
        },
      ]}
      products={products}
      emptyMessage="Console listings will appear here once the catalog is populated."
      ctaLabel="Shop consoles"
      ctaHref="/shop?category=consoles"
      secondaryCtaLabel="Explore accessories"
      secondaryCtaHref="/accessories"
      productListTitle="Console and accessory favorites"
    />
  );
}
