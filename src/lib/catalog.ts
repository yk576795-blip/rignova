import prisma from "./db";

export interface CatalogProductSummary {
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

export interface CatalogCategoryPageData {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    productCount: number;
  };
  products: CatalogProductSummary[];
}

export async function getCatalogCollectionData(slug: string, limit = 6): Promise<CatalogCategoryPageData> {
  try {
    const category = await prisma.category.findFirst({
      where: {
        slug,
        isActive: true,
        deletedAt: null,
      },
      include: {
        _count: {
          select: { products: { where: { isActive: true, deletedAt: null } } },
        },
      },
    });

    if (!category) {
      return {
        category: {
          id: slug,
          name: slug,
          slug,
          description: null,
          image: null,
          productCount: 0,
        },
        products: [],
      };
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        categoryId: category.id,
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        images: {
          where: { isPrimary: true },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
        specs: {
          take: 1,
          orderBy: { key: "asc" },
        },
      },
    });

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        productCount: category._count.products,
      },
      products: products.map((product: (typeof products)[number]) => {
        const reviewCount = product.reviews.length;
        const avgRating =
          reviewCount > 0
            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : 0;

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
          image: product.images[0]?.url || "/images/placeholder.jpg",
          brand: product.brand.name,
          category: product.category.name,
          condition: product.condition,
          shortDescription: product.shortDescription || product.description?.slice(0, 120) || null,
          stock: product.stock,
          inStock: product.stock > 0,
          rating: Math.round(avgRating * 10) / 10,
          reviewCount,
          badge: product.isFeatured ? "Featured" : undefined,
          previewSpec: product.specs[0] ? `${product.specs[0].key}: ${product.specs[0].value}` : null,
        };
      }),
    };
  } catch (error) {
    console.error("Failed to load catalog collection:", error);
    return {
      category: {
        id: slug,
        name: slug,
        slug,
        description: null,
        image: null,
        productCount: 0,
      },
      products: [],
    };
  }
}
