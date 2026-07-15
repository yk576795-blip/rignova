import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma, ProductCondition } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const category = searchParams.get("category");
    const brands = searchParams.get("brand")?.split(",").filter(Boolean);
    const conditions = searchParams
      .get("condition")
      ?.split(",")
      .filter(Boolean) as ProductCondition[];
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const hasRgb = searchParams.get("hasRgb") === "true" ? true : undefined;
    const inStock = searchParams.get("inStock") === "true" ? true : undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "12"));
    const skip = (page - 1) * limit;

    // Build Prisma query filter
    const whereClause: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null,
    };

    if (category) {
      whereClause.category = {
        slug: category,
      };
    }

    if (brands && brands.length > 0) {
      whereClause.brand = {
        slug: { in: brands },
      };
    }

    if (conditions && conditions.length > 0) {
      whereClause.condition = { in: conditions };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {};
      if (minPrice !== undefined) {
        whereClause.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        whereClause.price.lte = maxPrice;
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (hasRgb !== undefined) {
      whereClause.hasRgb = hasRgb;
    }

    if (inStock !== undefined) {
      whereClause.stock = inStock ? { gt: 0 } : undefined;
    }

    // Build Prisma sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "price-asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price-desc") {
      orderBy = { price: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "best-selling") {
      // Order by orderItems count or just default featured/newest for mock database
      orderBy = { isFeatured: "desc" };
    }

    // Query Products & Count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: {
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
          reviews: {
            where: { isApproved: true },
            select: { rating: true },
          },
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // Format products to include average rating
    const formattedProducts = products.map((product) => {
      const reviewCount = product.reviews.length;
      const avgRating =
        reviewCount > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          : 0;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        brand: product.brand.name,
        brandSlug: product.brand.slug,
        category: product.category.name,
        categorySlug: product.category.slug,
        condition: product.condition,
        stock: product.stock,
        inStock: product.stock > 0,
        hasRgb: product.hasRgb,
        warrantyMonths: product.warrantyMonths,
        image: product.images[0]?.url || "/images/placeholder.jpg",
        rating: Math.round(avgRating * 10) / 10,
        reviewCount,
      };
    });

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({
      products: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 12,
        pages: 0,
      },
    });
  }
}
