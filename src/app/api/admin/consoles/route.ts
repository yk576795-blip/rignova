import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const consoles = await db.product.findMany({
      where: {
        category: {
          name: { contains: "Consoles", mode: "insensitive" }
        },
        deletedAt: null,
      },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        specs: true,
        images: { 
          select: { url: true, alt: true },
          take: 1
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(consoles);
  } catch (error) {
    console.error("Failed to fetch consoles:", error);
    return Response.json([], { status: 500 });
  }
}