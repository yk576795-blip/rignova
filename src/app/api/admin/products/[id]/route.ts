import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const productUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  shortDescription: z.string().optional().nullable(),
  sku: z.string().min(2).optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  condition: z
    .enum(["NEW", "REFURBISHED", "USED_EXCELLENT", "USED_GOOD", "USED_FAIR"])
    .optional(),
  stock: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  hasRgb: z.boolean().optional(),
  warrantyMonths: z.number().int().min(0).optional(),
  weight: z.number().positive().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.string().url(),
        alt: z.string().optional().nullable(),
        isPrimary: z.boolean().default(false),
        sortOrder: z.number().int().default(0),
      })
    )
    .optional(),
  specs: z
    .array(
      z.object({
        id: z.string().optional(),
        group: z.string(),
        key: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  benchmarks: z
    .array(
      z.object({
        id: z.string().optional(),
        game: z.string(),
        resolution: z.string(),
        fps: z.number().int(),
        settings: z.string().default("Ultra"),
      })
    )
    .optional(),
});

// GET single product for editing
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        specs: true,
        benchmarks: true,
        usedGpuDetails: true,
        _count: { select: { reviews: true, orderItems: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      weight: product.weight ? Number(product.weight) : null,
    });
  } catch (error) {
    console.error("Admin product GET error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PUT: update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const existing = await prisma.product.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = parsed.data;

    // Handle slug update if name changed
    let slug: string | undefined;
    if (data.name && data.name !== existing.name) {
      slug = slugify(data.name);
      const slugConflict = await prisma.product.findFirst({
        where: { slug, id: { not: id }, deletedAt: null },
      });
      if (slugConflict) slug = `${slug}-${Date.now()}`;
    }

    // Run images/specs/benchmarks replacement in a transaction
    const product = await prisma.$transaction(async (tx) => {
      // Replace images if provided
      if (data.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (data.images.length > 0) {
          await tx.productImage.createMany({
            data: data.images.map((img, i) => ({
              productId: id,
              url: img.url,
              alt: img.alt ?? data.name ?? existing.name,
              isPrimary: i === 0,
              sortOrder: i,
            })),
          });
        }
      }

      // Replace specs if provided
      if (data.specs !== undefined) {
        await tx.productSpec.deleteMany({ where: { productId: id } });
        if (data.specs.length > 0) {
          await tx.productSpec.createMany({
            data: data.specs.map((s) => ({
              productId: id,
              group: s.group,
              key: s.key,
              value: s.value,
            })),
          });
        }
      }

      // Replace benchmarks if provided
      if (data.benchmarks !== undefined) {
        await tx.productBenchmark.deleteMany({ where: { productId: id } });
        if (data.benchmarks.length > 0) {
          await tx.productBenchmark.createMany({
            data: data.benchmarks.map((b) => ({
              productId: id,
              game: b.game,
              resolution: b.resolution,
              fps: b.fps,
              settings: b.settings,
            })),
          });
        }
      }

      return tx.product.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(slug && { slug }),
          ...(data.description && { description: data.description }),
          shortDescription: data.shortDescription,
          ...(data.sku && { sku: data.sku }),
          ...(data.price !== undefined && { price: data.price }),
          compareAtPrice: data.compareAtPrice,
          costPrice: data.costPrice,
          ...(data.brandId && { brandId: data.brandId }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.condition && { condition: data.condition }),
          ...(data.stock !== undefined && { stock: data.stock }),
          ...(data.lowStockThreshold !== undefined && {
            lowStockThreshold: data.lowStockThreshold,
          }),
          ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.hasRgb !== undefined && { hasRgb: data.hasRgb }),
          ...(data.warrantyMonths !== undefined && {
            warrantyMonths: data.warrantyMonths,
          }),
          weight: data.weight,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
        },
        include: {
          brand: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          images: { orderBy: { sortOrder: "asc" } },
          specs: true,
          benchmarks: true,
        },
      });
    });

    return NextResponse.json({
      ...product,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      costPrice: product.costPrice ? Number(product.costPrice) : null,
    });
  } catch (error: unknown) {
    console.error("Admin product PUT error:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE: soft delete product
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.product.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin product DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
