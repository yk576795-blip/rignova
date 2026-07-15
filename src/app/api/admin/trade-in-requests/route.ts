import { NextRequest } from "next/server";
import prisma from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const requests = await prisma.tradeInRequest.findMany({
      where: { deletedAt: null },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(
      requests.map((r) => ({
        id: r.id,
        // Prefer linked user data; fall back to guest fields
        customerName: r.user?.name ?? r.guestName ?? "Unknown",
        customerEmail: r.user?.email ?? r.guestEmail ?? "—",
        customerPhone: r.user?.phone ?? r.guestPhone ?? "—",
        gpuModel: r.gpuModel,
        gpuBrand: r.gpuBrand,
        purchaseYear: r.purchaseYear,
        condition: r.condition,
        description: r.description,
        estimatedValue: Number(r.expectedPrice),
        finalOfferValue: r.offeredPrice ? Number(r.offeredPrice) : null,
        status: r.status,
        submissionDate: r.createdAt.toISOString(),
        // images is String[] in schema — adapt to { url } shape the page expects
        photos: (r.images ?? []).map((url: string) => ({ url, description: "" })),
        adminNotes: r.adminNotes,
        rejectionReason: r.rejectionReason,
      }))
    );
  } catch (error) {
    console.error("Trade-in GET error:", error);
    return Response.json([], { status: 500 });
  }
}
