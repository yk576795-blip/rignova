import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const tradeInRequests = await db.tradeInRequest.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Format the data to match the expected structure
    const formattedRequests = tradeInRequests.map(request => ({
      id: request.id,
      customerName: request.user?.name || request.customerName || "Unknown",
      customerEmail: request.user?.email || request.customerEmail || "Unknown",
      customerPhone: request.user?.phone || request.customerPhone || "Unknown",
      gpuModel: request.gpuModel,
      gpuBrand: request.gpuBrand,
      purchaseYear: request.purchaseYear,
      condition: request.condition,
      description: request.description,
      estimatedValue: Number(request.estimatedValue),
      finalOfferValue: request.finalOfferValue ? Number(request.finalOfferValue) : undefined,
      status: request.status,
      submissionDate: request.createdAt.toISOString(),
      photos: request.photos || [],
      adminNotes: request.adminNotes,
      rejectionReason: request.rejectionReason,
    }));

    return Response.json(formattedRequests);
  } catch (error) {
    console.error("Failed to fetch trade-in requests:", error);
    return Response.json([], { status: 500 });
  }
}