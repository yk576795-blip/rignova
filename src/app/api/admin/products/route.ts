import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  shortDescription: z.string().optional().nullable(),
  sku: z.string().min(2),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  brandId: z.string().uuid(),
  categoryId: z.string().uuid(),
  condition: z.enum(["NEW", "REFURBISHED", "USED_EXCELLENT", "USED_GOOD", "USED_FAIR"]),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  hasRgb: z.boolean().default(false),
  warrantyMonths: z.number().int().min(0).default(12),
  weight: z.number().positive().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional().nullable(),
        isPrimary: z.boolean().default(false),
        sortOrder: z.number().int().default(0),
      })
    )
    .optional()
    .default([]),
  specs: z
    .array(
      z.object({
        group: z.string(),
        key: z.string(),
        value: z.string(),
      })
    )
    .optional()
    .default([]),
  benchmarks: z
    .array(
      z.object({
        game: z.string(),
        resolution: z.string(),
        fps: z.number().int(),
        settings: z.string().default("Ultra"),
      })
    )
    .optional()
    .default([]),
});

// GET: list all products (admin, no active filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const brandId = searchParams.get("brandId") || "";

    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          brand: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          _count: { select: { reviews: true, orderItems: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        brand: p.brand,
        category: p.category,
        condition: p.condition,
        stock: p.stock,
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        hasRgb: p.hasRgb,
        image: p.images[0]?.url ?? null,
        reviewCount: p._count.reviews,
        orderCount: p._count.orderItems,
        createdAt: p.createdAt.toISOString(),
      })),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST: create product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const data = parsed.data;
    let slug = slugify(data.name);

    // Ensure unique slug
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        sku: data.sku,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? undefined,
        costPrice: data.costPrice ?? undefined,
        brandId: data.brandId,
        categoryId: data.categoryId,
        condition: data.condition,
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        hasRgb: data.hasRgb,
        warrantyMonths: data.warrantyMonths,
        weight: data.weight ?? undefined,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        images: {
          create: data.images.map((img, i) => ({
            url: img.url,
            alt: img.alt ?? data.name,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        },
        specs: {
          create: data.specs,
        },
        benchmarks: {
          create: data.benchmarks,
        },
      },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        images: true,
        specs: true,
        benchmarks: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error("Admin product POST error:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "SKU or slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
