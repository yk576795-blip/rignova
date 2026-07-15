import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const brandSchema = z.object({
  name: z.string().min(1),
  logo: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";

    const brands = await prisma.brand.findMany({
      where: {
        deletedAt: null,
        ...(search && { name: { contains: search, mode: "insensitive" } }),
      },
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json(
      brands.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        logo: b.logo,
        description: b.description,
        website: b.website,
        isActive: b.isActive,
        productCount: b._count.products,
        createdAt: b.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Admin brands GET error:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = brandSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const data = parsed.data;
    const slug = slugify(data.name);

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug,
        logo: data.logo,
        description: data.description,
        website: data.website,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error: unknown) {
    console.error("Admin brand POST error:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "Brand name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}
