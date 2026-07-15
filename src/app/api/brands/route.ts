import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: { products: { where: { isActive: true, deletedAt: null } } },
        },
      },
    });

    const formattedBrands = brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      description: brand.description,
      productCount: brand._count.products,
    }));

    return NextResponse.json(formattedBrands);
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return NextResponse.json([]);
  }
}
