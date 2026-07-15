import { NextRequest } from "next/server";
import prisma from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const [
      totalRequests,
      pendingReview,
      approvedRequests,
      allRequests,
      completedThisMonth,
      paidRequests,
    ] = await Promise.all([
      prisma.tradeInRequest.count({ where: { deletedAt: null } }),

      prisma.tradeInRequest.count({
        where: {
          deletedAt: null,
          status: { in: ["SUBMITTED", "PENDING_REVIEW"] },
        },
      }),

      prisma.tradeInRequest.count({
        where: { deletedAt: null, status: "APPROVED" },
      }),

      prisma.tradeInRequest.findMany({
        where: { deletedAt: null },
        select: { expectedPrice: true },
      }),

      prisma.tradeInRequest.count({
        where: {
          deletedAt: null,
          status: { in: ["RECEIVED", "PAID"] },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      prisma.tradeInRequest.findMany({
        where: { deletedAt: null, status: "PAID" },
        select: { offeredPrice: true },
      }),
    ]);

    const averageValue =
      allRequests.length > 0
        ? Math.round(
            allRequests.reduce((s, r) => s + Number(r.expectedPrice), 0) /
              allRequests.length
          )
        : 0;

    const totalPaidOut = paidRequests.reduce(
      (s, r) => s + (r.offeredPrice ? Number(r.offeredPrice) : 0),
      0
    );

    return Response.json({
      totalRequests,
      pendingReview,
      approvedRequests,
      averageValue,
      completedThisMonth,
      totalPaidOut: Math.round(totalPaidOut),
    });
  } catch (error) {
    console.error("Trade-in stats error:", error);
    return Response.json(
      {
        totalRequests: 0,
        pendingReview: 0,
        approvedRequests: 0,
        averageValue: 0,
        completedThisMonth: 0,
        totalPaidOut: 0,
      },
      { status: 500 }
    );
  }
}
