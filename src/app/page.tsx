import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { ProductGridSection } from "@/components/home/product-grid-section";
import { PcBuilderCta } from "@/components/home/pc-builder-cta";
import { FeaturedBuilds } from "@/components/home/featured-builds";
import { TradeInBanner } from "@/components/home/trade-in-banner";
import { BrandLogos } from "@/components/home/brand-logos";
import { Testimonials } from "@/components/home/testimonials";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { FaqSection } from "@/components/home/faq-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { InstagramFeed } from "@/components/home/instagram-feed";
import { MOCK_PRODUCTS, FEATURED_CATEGORIES } from "@/lib/constants/mock-data";
import {
  getNewestProducts,
  getFeaturedProducts,
  getUsedGpus,
  getActiveCategories,
  getCategorySections,
} from "@/lib/homepage-data";

export const revalidate = 60; // ISR — revalidate every 60 seconds

export default async function HomePage() {
  // Fetch everything in parallel
  const [
    newestProducts,
    featuredProducts,
    usedGpus,
    dbCategories,
    categorySections,
  ] = await Promise.all([
    getNewestProducts(8),
    getFeaturedProducts(4),
    getUsedGpus(4),
    getActiveCategories(),
    getCategorySections(6, 4),
  ]);

  const hasRealProducts = newestProducts.length > 0 || categorySections.length > 0;

  // Best Sellers: featured products first, then newest
  const bestSellers =
    featuredProducts.length > 0
      ? featuredProducts
      : newestProducts.length > 0
      ? newestProducts.slice(0, 4)
      : MOCK_PRODUCTS.slice(0, 4);

  // Used GPU deals
  const usedGpuProducts =
    usedGpus.length > 0
      ? usedGpus
      : MOCK_PRODUCTS.filter((p) => p.category === "Used GPUs");

  // Categories grid — real ones if available, else static
  const categories =
    dbCategories.length > 0
      ? dbCategories.map((c, i) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image ?? "",
          productCount: c.productCount,
          gradient: CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length],
        }))
      : FEATURED_CATEGORIES.map((c) => ({ ...c, image: c.image }));

  return (
    <>
      <HeroSection />
      <FeaturedCategories categories={categories} />

      {/* Best Sellers — always shown */}
      <ProductGridSection
        subtitle="Trending"
        title="Best Sellers"
        products={bestSellers}
        viewAllHref="/shop?sort=best-selling"
      />

      {hasRealProducts ? (
        <>
          {/* Dynamic category sections — one per category that has products */}
          {categorySections.map((section, i) => (
            <ProductGridSection
              key={section.id}
              subtitle={SECTION_SUBTITLES[i % SECTION_SUBTITLES.length]}
              title={section.name}
              products={section.products}
              viewAllHref={`/shop?category=${section.slug}`}
            />
          ))}
        </>
      ) : (
        <>
          {/* Fallback mock sections when DB is empty */}
          <ProductGridSection
            subtitle="Pre-Built"
            title="Gaming PCs"
            description="Ready-to-ship battle stations tuned for peak performance."
            products={MOCK_PRODUCTS.filter((p) => p.category === "Gaming PCs")}
            viewAllHref="/shop?category=gaming-pcs"
          />
          <ProductGridSection
            subtitle="Latest"
            title="Graphics Cards"
            products={MOCK_PRODUCTS.filter((p) => p.category === "GPUs")}
            viewAllHref="/shop?category=gpus"
          />
          <ProductGridSection
            subtitle="Components"
            title="Popular Components"
            products={MOCK_PRODUCTS.filter((p) =>
              ["CPUs", "RAM", "Storage", "Motherboards"].includes(p.category)
            )}
            viewAllHref="/shop?category=components"
          />
        </>
      )}

      <PcBuilderCta />
      <FeaturedBuilds />

      {/* Used GPU Deals */}
      {usedGpuProducts.length > 0 && (
        <ProductGridSection
          subtitle="Deals"
          title="Used GPU Deals"
          description="Certified pre-owned graphics cards with full stress testing and warranty."
          products={usedGpuProducts}
          viewAllHref="/used-gpus"
        />
      )}

      <TradeInBanner />
      <BrandLogos />
      <Testimonials />
      <WhyChooseUs />
      <FaqSection />
      <NewsletterSection />
      <InstagramFeed />
    </>
  );
}

const CATEGORY_GRADIENTS = [
  "from-cyan-500/20 to-blue-600/20",
  "from-green-500/20 to-cyan-500/20",
  "from-blue-500/20 to-purple-600/20",
  "from-orange-500/20 to-red-500/20",
  "from-pink-500/20 to-rose-500/20",
  "from-violet-500/20 to-indigo-500/20",
];

// Rotating subtitles for category sections
const SECTION_SUBTITLES = [
  "Pre-Built",
  "Latest",
  "Components",
  "Accessories",
  "Deals",
  "New Arrivals",
];
