import prisma from "@/lib/db";
import type { ProductCardData } from "@/lib/constants/mock-data";

// Shape a Prisma product row into ProductCardData used by ProductCard
function toCardData(product: {
  id: string;
  name: string;
  slug: string;
  price: { toNumber: () => number } | number;
  compareAtPrice: { toNumber: () => number } | number | null;
  condition: string;
  stock: number;
  isFeatured: boolean;
  brand: { name: string };
  category: { name: string };
  images: { url: string }[];
  reviews: { rating: number }[];
}): ProductCardData {
  const reviewCount = product.reviews.length;
  const avgRating =
    reviewCount > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
      : 0;

  const price =
    typeof product.price === "number"
      ? product.price
      : product.price.toNumber();

  const compareAtPrice =
    product.compareAtPrice == null
      ? undefined
      : typeof product.compareAtPrice === "number"
      ? product.compareAtPrice
      : product.compareAtPrice.toNumber();

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price,
    compareAtPrice,
    image: product.images[0]?.url ?? "/images/placeholder.jpg",
    brand: product.brand.name,
    category: product.category.name,
    condition: product.condition !== "NEW" ? product.condition.replace("_", " ") : undefined,
    rating: Math.round(avgRating * 10) / 10,
    reviewCount,
    badge: product.isFeatured ? "Featured" : undefined,
    inStock: product.stock > 0,
  };
}

const include = {
  brand: { select: { name: true } },
  category: { select: { name: true } },
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  reviews: { where: { isApproved: true }, select: { rating: true } },
};

// Fetch newest active products
export async function getNewestProducts(limit = 8): Promise<ProductCardData[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
      include,
    });
    return products.map(toCardData);
  } catch {
    return [];
  }
}

// Featured products (isFeatured = true)
export async function getFeaturedProducts(limit = 4): Promise<ProductCardData[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, deletedAt: null, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include,
    });
    return products.map(toCardData);
  } catch {
    return [];
  }
}

// Products by category slug
export async function getProductsByCategory(
  categorySlug: string,
  limit = 4
): Promise<ProductCardData[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        category: { slug: categorySlug },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include,
    });
    return products.map(toCardData);
  } catch {
    return [];
  }
}

// Used GPUs only
export async function getUsedGpus(limit = 4): Promise<ProductCardData[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        condition: { not: "NEW" },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include,
    });
    return products.map(toCardData);
  } catch {
    return [];
  }
}

// Real categories with product counts
export async function getActiveCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, deletedAt: null, parentId: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 6,
      include: { _count: { select: { products: { where: { isActive: true, deletedAt: null } } } } },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      productCount: c._count.products,
    }));
  } catch {
    return [];
  }
}

// All categories that have at least 1 product, with up to 4 products each
export interface CategorySection {
  id: string;
  name: string;
  slug: string;
  products: ProductCardData[];
}

export async function getCategorySections(
  maxCategories = 6,
  productsPerCategory = 4
): Promise<CategorySection[]> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        products: {
          some: { isActive: true, deletedAt: null },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: maxCategories,
      include: {
        products: {
          where: { isActive: true, deletedAt: null },
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
          take: productsPerCategory,
          include,
        },
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      products: cat.products.map(toCardData),
    }));
  } catch {
    return [];
  }
}
