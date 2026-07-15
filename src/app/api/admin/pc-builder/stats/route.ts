import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const [
      totalComponents,
      activeComponents,
      outOfStockComponents,
      totalBuilds,
      buildsWithPrices,
      popularComponent
    ] = await Promise.all([
      // Total PC components
      db.product.count({
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
        }
      }),

      // Active components
      db.product.count({
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
          isActive: true,
          deletedAt: null,
        }
      }),

      // Out of stock components
      db.product.count({
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
          stock: 0,
          deletedAt: null,
        }
      }),

      // Total saved builds
      db.savedBuild.count({
        where: { deletedAt: null }
      }),

      // Builds with items for price calculation
      db.savedBuild.findMany({
        where: { deletedAt: null },
        include: {
          items: {
            include: {
              component: {
                select: { price: true }
              }
            }
          }
        }
      }),

      // Most popular component (simplified - most used in builds)
      db.buildItem.groupBy({
        by: ['componentId'],
        _count: { componentId: true },
        orderBy: { _count: { componentId: 'desc' } },
        take: 1
      }).then(async (result) => {
        if (result.length > 0) {
          const product = await db.product.findUnique({
            where: { id: result[0].componentId },
            select: { name: true }
          });
          return product?.name || "No data";
        }
        return "No data";
      })
    ]);

    // Calculate average build price
    const totalBuildValue = buildsWithPrices.reduce((total, build) => {
      const buildTotal = build.items.reduce((buildSum, item) => 
        buildSum + (Number(item.component.price) * item.quantity), 0
      );
      return total + buildTotal;
    }, 0);

    const avgBuildPrice = totalBuilds > 0 ? Math.round(totalBuildValue / totalBuilds) : 0;

    const stats = {
      totalComponents,
      activeComponents,
      outOfStock: outOfStockComponents,
      totalBuilds,
      avgBuildPrice,
      popularComponent
    };

    return Response.json(stats);
  } catch (error) {
    console.error("Failed to fetch PC builder stats:", error);
    return Response.json({
      totalComponents: 0,
      activeComponents: 0,
      outOfStock: 0,
      totalBuilds: 0,
      avgBuildPrice: 0,
      popularComponent: "No data"
    }, { status: 500 });
  }
}