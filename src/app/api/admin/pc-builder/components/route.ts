import { NextRequest } from "next/server";
import prisma from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const components = await prisma.pcComponent.findMany({
      where: { deletedAt: null },
      include: {
        type: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(
      components.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        price: Number(c.price),
        tdp: c.tdp,
        socket: c.socket,
        chipset: c.chipset,
        ramType: c.ramType,
        formFactor: c.formFactor,
        wattage: c.wattage,
        isActive: c.isActive,
        categoryName: c.type.name,
        brandId: c.brandId,
      }))
    );
  } catch (error) {
    console.error("Failed to fetch PC components:", error);
    return Response.json([], { status: 500 });
  }
}
