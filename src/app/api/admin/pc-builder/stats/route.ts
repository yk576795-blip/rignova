import { NextRequest } from "next/server";
import prisma from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const [totalComponents, activeComponents, outOfStock, totalBuilds, popularItem] =
      await Promise.all([
        prisma.pcComponent.count({ where: { deletedAt: null } }),
        prisma.pcComponent.count({ where: { isActive: true, deletedAt: null } }),
        prisma.pcComponent.count({ where: { deletedAt: null, isActive: false } }),
        prisma.savedBuild.count({ where: { deletedAt: null } }),
        prisma.buildItem
          .groupBy({
            by: ["componentId"],
            _count: { componentId: true },
            orderBy: { _count: { componentId: "desc" } },
            take: 1,
          })
          .then(async (rows) => {
            if (!rows.length) return "No data";
            const comp = await prisma.pcComponent.findUnique({
              where: { id: rows[0].componentId },
              select: { name: true },
            });
            return comp?.name ?? "No data";
          }),
      ]);

    // Average build price from stored totalPrice
    const buildPrices = await prisma.savedBuild.findMany({
      where: { deletedAt: null },
      select: { totalPrice: true },
    });
    const avgBuildPrice =
      buildPrices.length > 0
        ? Math.round(
            buildPrices.reduce((s, b) => s + Number(b.totalPrice), 0) /
              buildPrices.length
          )
        : 0;

    return Response.json({
      totalComponents,
      activeComponents,
      outOfStock,
      totalBuilds,
      avgBuildPrice,
      popularComponent: popularItem,
    });
  } catch (error) {
    console.error("Failed to fetch PC builder stats:", error);
    return Response.json(
      {
        totalComponents: 0,
        activeComponents: 0,
        outOfStock: 0,
        totalBuilds: 0,
        avgBuildPrice: 0,
        popularComponent: "No data",
      },
      { status: 500 }
    );
  }
}
