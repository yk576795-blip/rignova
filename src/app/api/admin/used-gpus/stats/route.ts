import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const [
      totalUsedGpus,
      usedGpusWithDetails,
      bestPerformerData,
      lowStockCount,
      recentListings
    ] = await Promise.all([
      // Total used GPUs
      db.product.count({
        where: {
          condition: {
            in: ["USED_EXCELLENT", "USED_GOOD", "USED_FAIR"]
          },
          category: {
            name: { contains: "Graphics Cards", mode: "insensitive" }
          },
          deletedAt: null,
        }
      }),

      // Used GPUs with condition and pricing data
      db.product.findMany({
        where: {
          condition: {
            in: ["USED_EXCELLENT", "USED_GOOD", "USED_FAIR"]
          },
          category: {
            name: { contains: "Graphics Cards", mode: "insensitive" }
          },
          deletedAt: null,
        },
        select: {
          condition: true,
          price: true,
        }
      }),

      // Best performer by benchmarks
      db.product.findFirst({
        where: {
          condition: {
            in: ["USED_EXCELLENT", "USED_GOOD", "USED_FAIR"]
          },
          category: {
            name: { contains: "Graphics Cards", mode: "insensitive" }
          },
          deletedAt: null,
          benchmarks: {
            some: {}
          }
        },
        include: {
          benchmarks: true
        },
        orderBy: {
          benchmarks: {
            _count: "desc"
          }
        }
      }),

      // Low stock GPUs (stock <= 2)
      db.product.count({
        where: {
          condition: {
            in: ["USED_EXCELLENT", "USED_GOOD", "USED_FAIR"]
          },
          category: {
            name: { contains: "Graphics Cards", mode: "insensitive" }
          },
          stock: { lte: 2 },
          deletedAt: null,
        }
      }),

      // Recent listings (this week)
      db.product.count({
        where: {
          condition: {
            in: ["USED_EXCELLENT", "USED_GOOD", "USED_FAIR"]
          },
          category: {
            name: { contains: "Graphics Cards", mode: "insensitive" }
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
          },
          deletedAt: null,
        }
      })
    ]);

    // Calculate average condition (simplified scoring)
    const conditionScores = { USED_EXCELLENT: 3, USED_GOOD: 2, USED_FAIR: 1 };
    const avgConditionScore = usedGpusWithDetails.length > 0 
      ? usedGpusWithDetails.reduce((sum, gpu) => sum + conditionScores[gpu.condition as keyof typeof conditionScores], 0) / usedGpusWithDetails.length
      : 0;
    
    let averageCondition = "Fair";
    if (avgConditionScore >= 2.5) averageCondition = "Excellent";
    else if (avgConditionScore >= 1.5) averageCondition = "Good";

    // Calculate average price
    const averagePrice = usedGpusWithDetails.length > 0
      ? Math.round(usedGpusWithDetails.reduce((sum, gpu) => sum + Number(gpu.price), 0) / usedGpusWithDetails.length)
      : 0;

    // Get best performer name
    const bestPerformer = bestPerformerData?.name || "No data";

    const stats = {
      totalUsedGpus,
      averageCondition,
      averagePrice,
      bestPerformer,
      lowStockCount,
      recentListings
    };

    return Response.json(stats);
  } catch (error) {
    console.error("Failed to fetch used GPU stats:", error);
    return Response.json({
      totalUsedGpus: 0,
      averageCondition: "Fair",
      averagePrice: 0,
      bestPerformer: "No data",
      lowStockCount: 0,
      recentListings: 0
    }, { status: 500 });
  }
}