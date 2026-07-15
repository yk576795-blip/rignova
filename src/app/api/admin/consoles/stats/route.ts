import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const [
      totalConsoles,
      newConsoles,
      refurbishedConsoles,
      consolesWithPricing,
      topBrandData,
      lowStockCount
    ] = await Promise.all([
      // Total consoles
      db.product.count({
        where: {
          category: {
            name: { contains: "Consoles", mode: "insensitive" }
          },
          deletedAt: null,
        }
      }),

      // New consoles
      db.product.count({
        where: {
          category: {
            name: { contains: "Consoles", mode: "insensitive" }
          },
          condition: "NEW",
          deletedAt: null,
        }
      }),

      // Refurbished consoles
      db.product.count({
        where: {
          category: {
            name: { contains: "Consoles", mode: "insensitive" }
          },
          condition: "REFURBISHED",
          deletedAt: null,
        }
      }),

      // Consoles with pricing data
      db.product.findMany({
        where: {
          category: {
            name: { contains: "Consoles", mode: "insensitive" }
          },
          deletedAt: null,
        },
        select: {
          price: true,
          brandId: true,
        }
      }),

      // Most popular brand
      db.product.groupBy({
        by: ['brandId'],
        where: {
          category: {
            name: { contains: "Consoles", mode: "insensitive" }
          },
          deletedAt: null,
        },
        _count: { brandId: true },
        orderBy: { _count: { brandId: 'desc' } },
        take: 1
      }).then(async (result) => {
        if (result.length > 0) {
          const brand = await db.brand.findUnique({
            where: { id: result[0].brandId },
            select: { name: true }
          });
          return brand?.name || "No data";
        }
        return "No data";
      }),

      // Low stock consoles (stock <= 5)
      db.product.count({
        where: {
          category: {
            name: { contains: "Consoles", mode: "insensitive" }
          },
          stock: { lte: 5 },
          deletedAt: null,
        }
      })
    ]);

    // Calculate average price
    const averagePrice = consolesWithPricing.length > 0
      ? Math.round(consolesWithPricing.reduce((sum, console) => sum + Number(console.price), 0) / consolesWithPricing.length)
      : 0;

    const stats = {
      totalConsoles,
      newConsoles,
      refurbishedConsoles,
      averagePrice,
      mostPopularBrand: topBrandData,
      lowStockCount
    };

    return Response.json(stats);
  } catch (error) {
    console.error("Failed to fetch console stats:", error);
    return Response.json({
      totalConsoles: 0,
      newConsoles: 0,
      refurbishedConsoles: 0,
      averagePrice: 0,
      mostPopularBrand: "No data",
      lowStockCount: 0
    }, { status: 500 });
  }
}