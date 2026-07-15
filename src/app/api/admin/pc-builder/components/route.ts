import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const pcComponents = await db.product.findMany({
      where: {
        category: {
          OR: [
            { name: { contains: "Graphics Cards", mode: "insensitive" } },
            { name: { contains: "Processors", mode: "insensitive" } },
            { name: { contains: "Motherboards", mode: "insensitive" } },
            { name: { contains: "Memory", mode: "insensitive" } },
            { name: { contains: "Storage", mode: "insensitive" } },
            { name: { contains: "Power Supplies", mode: "insensitive" } },
            { name: { contains: "Cases", mode: "insensitive" } },
          ]
        },
        deletedAt: null,
      },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        specs: true,
        benchmarks: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(pcComponents);
  } catch (error) {
    console.error("Failed to fetch PC components:", error);
    return Response.json([], { status: 500 });
  }
}