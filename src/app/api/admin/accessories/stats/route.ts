import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const [
      totalAccessories,
      rgbAccessories,
      accessoriesWithPricing,
      topCategoryData,
      lowStockCount,
      newThisWeek
    ] = await Promise.all([
      // Total accessories
      db.product.count({
        where: {
          category: {
            OR: [
              { name: { contains: "Keyboards", mode: "insensitive" } },
              { name: { contains: "Mice", mode: "insensitive" } },
              { name: { contains: "Headsets", mode: "insensitive" } },
              { name: { contains: "Monitors", mode: "insensitive" } },
              { name: { contains: "Webcams", mode: "insensitive" } },
              { name: { contains: "Speakers", mode: "insensitive" } },
              { name: { contains: "Mousepads", mode: "insensitive" } },
              { name: { contains: "Microphones", mode: "insensitive" } },
              { name: { contains: "Accessories", mode: "insensitive" } },
            ]
          },
          deletedAt: null,
        }
      }),

      // RGB accessories
      db.product.count({
        where: {
          category: {
            OR: [
              { name: { contains: "Keyboards", mode: "insensitive" } },
              { name: { contains: "Mice", mode: "insensitive" } },
              { name: { contains: "Headsets", mode: "insensitive" } },
              { name: { contains: "Monitors", mode: "insensitive" } },
              { name: { contains: "Webcams", mode: "insensitive" } },
              { name: { contains: "Speakers", mode: "insensitive" } },
              { name: { contains: "Mousepads", mode: "insensitive" } },
              { name: { contains: "Microphones", mode: "insensitive" } },
              { name: { contains: "Accessories", mode: "insensitive" } },
            ]
          },
          hasRgb: true,
          deletedAt: null,
        }
      }),

      // Accessories with pricing data
      db.product.findMany({
        where: {
          category: {
            OR: [
              { name: { contains: "Keyboards", mode: "insensitive" } },
              { name: { contains: "Mice", mode: "insensitive" } },
              { name: { contains: "Headsets", mode: "insensitive" } },
              { name: { contains: "Monitors", mode: "insensitive" } },
              { name: { contains: "Webcams", mode: "insensitive" } },
              { name: { contains: "Speakers", mode: "insensitive" } },
              { name: { contains: "Mousepads", mode: "insensitive" } },
              { name: { contains: "Microphones", mode: "insensitive" } },
              { name: { contains: "Accessories", mode: "insensitive" } },
            ]
          },
          deletedAt: null,
        },
        select: {
          price: true,
          categoryId: true,
        }
      }),

      // Most popular category
      db.product.groupBy({
        by: ['categoryId'],
        where: {
          category: {
            OR: [
              { name: { contains: "Keyboards", mode: "insensitive" } },
              { name: { contains: "Mice", mode: "insensitive" } },
              { name: { contains: "Headsets", mode: "insensitive" } },
              { name: { contains: "Monitors", mode: "insensitive" } },
              { name: { contains: "Webcams", mode: "insensitive" } },
              { name: { contains: "Speakers", mode: "insensitive" } },
              { name: { contains: "Mousepads", mode: "insensitive" } },
              { name: { contains: "Microphones", mode: "insensitive" } },
              { name: { contains: "Accessories", mode: "insensitive" } },
            ]
          },
          deletedAt: null,
        },
        _count: { categoryId: true },
        orderBy: { _count: { categoryId: 'desc' } },
        take: 1
      }).then(async (result) => {
        if (result.length > 0) {
          const category = await db.category.findUnique({
            where: { id: result[0].categoryId },
            select: { name: true }
          });
          return category?.name || "No data";
        }
        return "No data";
      }),

      // Low stock accessories (stock <= 5)
      db.product.count({
        where: {
          category: {
            OR: [
              { name: { contains: "Keyboards", mode: "insensitive" } },
              { name: { contains: "Mice", mode: "insensitive" } },
              { name: { contains: "Headsets", mode: "insensitive" } },
              { name: { contains: "Monitors", mode: "insensitive" } },
              { name: { contains: "Webcams", mode: "insensitive" } },
              { name: { contains: "Speakers", mode: "insensitive" } },
              { name: { contains: "Mousepads", mode: "insensitive" } },
              { name: { contains: "Microphones", mode: "insensitive" } },
              { name: { contains: "Accessories", mode: "insensitive" } },
            ]
          },
          stock: { lte: 5 },
          deletedAt: null,
        }
      }),

      // New this week
      db.product.count({
        where: {
          category: {
            OR: [
              { name: { contains: "Keyboards", mode: "insensitive" } },
              { name: { contains: "Mice", mode: "insensitive" } },
              { name: { contains: "Headsets", mode: "insensitive" } },
              { name: { contains: "Monitors", mode: "insensitive" } },
              { name: { contains: "Webcams", mode: "insensitive" } },
              { name: { contains: "Speakers", mode: "insensitive" } },
              { name: { contains: "Mousepads", mode: "insensitive" } },
              { name: { contains: "Microphones", mode: "insensitive" } },
              { name: { contains: "Accessories", mode: "insensitive" } },
            ]
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
          },
          deletedAt: null,
        }
      })
    ]);

    // Calculate average price
    const averagePrice = accessoriesWithPricing.length > 0
      ? Math.round(accessoriesWithPricing.reduce((sum, accessory) => sum + Number(accessory.price), 0) / accessoriesWithPricing.length)
      : 0;

    const stats = {
      totalAccessories,
      rgbAccessories,
      averagePrice,
      mostPopularCategory: topCategoryData,
      lowStockCount,
      newThisWeek
    };

    return Response.json(stats);
  } catch (error) {
    console.error("Failed to fetch accessories stats:", error);
    return Response.json({
      totalAccessories: 0,
      rgbAccessories: 0,
      averagePrice: 0,
      mostPopularCategory: "No data",
      lowStockCount: 0,
      newThisWeek: 0
    }, { status: 500 });
  }
}