import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalProducts,
      totalOrders,
      totalUsers,
      totalBrands,
      totalCategories,
      ordersThisMonth,
      ordersLastMonth,
      recentOrders,
      topProducts,
      lowStockProducts,
      ordersByStatus,
    ] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.brand.count({ where: { deletedAt: null } }),
      prisma.category.count({ where: { deletedAt: null } }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          deletedAt: null,
          paymentStatus: "CAPTURED",
        },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          deletedAt: null,
          paymentStatus: "CAPTURED",
        },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { quantity: true, total: true } },
        },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.product.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          stock: { lte: 5 },
        },
        select: { id: true, name: true, stock: true, sku: true },
        orderBy: { stock: "asc" },
        take: 8,
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
        where: { deletedAt: null },
      }),
    ]);

    // Revenue growth percentage
    const thisMonthRevenue = Number(ordersThisMonth._sum.total ?? 0);
    const lastMonthRevenue = Number(ordersLastMonth._sum.total ?? 0);
    const revenueGrowth =
      lastMonthRevenue === 0
        ? 100
        : Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

    // Enrich top products with names
    const topProductIds = topProducts.map((p) => p.productId);
    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, slug: true, images: { take: 1 } },
    });

    const enrichedTopProducts = topProducts.map((tp) => {
      const detail = topProductDetails.find((p) => p.id === tp.productId);
      return {
        productId: tp.productId,
        name: detail?.name ?? "Unknown",
        slug: detail?.slug ?? "",
        image: detail?.images[0]?.url ?? null,
        totalSold: tp._sum.quantity ?? 0,
      };
    });

    // Last 6 months revenue chart data
    const monthlyRevenue = await Promise.all(
      Array.from({ length: 6 }).map(async (_, i) => {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const agg = await prisma.order.aggregate({
          where: {
            createdAt: { gte: month, lte: monthEnd },
            paymentStatus: "CAPTURED",
            deletedAt: null,
          },
          _sum: { total: true },
          _count: true,
        });
        return {
          month: month.toLocaleString("en-IN", { month: "short", year: "2-digit" }),
          revenue: Number(agg._sum.total ?? 0),
          orders: agg._count,
        };
      })
    );

    return NextResponse.json({
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalBrands,
        totalCategories,
        thisMonthRevenue,
        lastMonthRevenue,
        revenueGrowth,
        thisMonthOrders: ordersThisMonth._count,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        user: o.user,
        status: o.status,
        paymentStatus: o.paymentStatus,
        total: Number(o.total),
        itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
        createdAt: o.createdAt.toISOString(),
      })),
      topProducts: enrichedTopProducts,
      lowStockProducts,
      ordersByStatus: ordersByStatus.map((o) => ({
        status: o.status,
        count: o._count,
      })),
      monthlyRevenue: monthlyRevenue.reverse(),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
