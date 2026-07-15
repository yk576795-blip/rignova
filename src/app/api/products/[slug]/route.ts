import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true, deletedAt: null },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        specs: true,
        benchmarks: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        usedGpuDetails: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Calculate rating stats
    const reviewCount = product.reviews.length;
    const avgRating =
      reviewCount > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    product.reviews.forEach((review) => {
      const rating = review.rating as 1 | 2 | 3 | 4 | 5;
      if (ratingDistribution[rating] !== undefined) {
        ratingDistribution[rating]++;
      }
    });

    const responseData = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      shortDescription: product.shortDescription,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      stock: product.stock,
      inStock: product.stock > 0,
      condition: product.condition,
      hasRgb: product.hasRgb,
      warrantyMonths: product.warrantyMonths,
      weight: product.weight ? Number(product.weight) : null,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      brand: {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug,
        logo: product.brand.logo,
      },
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      images: product.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
      })),
      specs: product.specs.map((spec) => ({
        id: spec.id,
        group: spec.group,
        key: spec.key,
        value: spec.value,
      })),
      benchmarks: product.benchmarks.map((bench) => ({
        id: bench.id,
        game: bench.game,
        resolution: bench.resolution,
        fps: bench.fps,
        settings: bench.settings,
      })),
      reviews: product.reviews.map((rev) => ({
        id: rev.id,
        rating: rev.rating,
        title: rev.title,
        comment: rev.comment,
        isVerified: rev.isVerified,
        createdAt: rev.createdAt.toISOString(),
        user: {
          name: rev.user.name,
          image: rev.user.image,
        },
      })),
      usedGpuDetails: product.usedGpuDetails
        ? {
            id: product.usedGpuDetails.id,
            grade: product.usedGpuDetails.grade,
            stressTestScore: product.usedGpuDetails.stressTestScore,
            benchmarkScore: product.usedGpuDetails.benchmarkScore,
            serialNumber: product.usedGpuDetails.serialNumber,
            purchaseDate: product.usedGpuDetails.purchaseDate
              ? product.usedGpuDetails.purchaseDate.toISOString()
              : null,
            sellerNotes: product.usedGpuDetails.sellerNotes,
            verified: product.usedGpuDetails.verified,
          }
        : null,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount,
      ratingDistribution,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch product details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
