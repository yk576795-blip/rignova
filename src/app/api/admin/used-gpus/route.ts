import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const usedGPUs = await db.product.findMany({
      where: {
        condition: {
          in: ["USED_EXCELLENT", "USED_GOOD", "USED_FAIR"]
        },
        category: {
          name: { contains: "Graphics Cards", mode: "insensitive" }
        },
        deletedAt: null,
      },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        specs: true,
        benchmarks: true,
        usedGpuDetails: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(usedGPUs);
  } catch (error) {
    console.error("Failed to fetch used GPUs:", error);
    return Response.json([], { status: 500 });
  }
}