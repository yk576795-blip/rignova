import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  status: z
    .enum([
      "SUBMITTED",
      "PENDING_REVIEW",
      "APPROVED",
      "REJECTED",
      "PICKUP_SCHEDULED",
      "RECEIVED",
      "PAID",
    ])
    .optional(),
  finalOfferValue: z.number().positive().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const existing = await prisma.tradeInRequest.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    const { status, finalOfferValue, adminNotes, rejectionReason } = parsed.data;

    const updated = await prisma.tradeInRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(finalOfferValue !== undefined && {
          offeredPrice: finalOfferValue ?? null,
        }),
        ...(adminNotes !== undefined && { adminNotes }),
        ...(rejectionReason !== undefined && { rejectionReason }),
      },
      select: { id: true, status: true },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("Trade-in PATCH error:", error);
    return Response.json({ error: "Failed to update request" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.tradeInRequest.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    await prisma.tradeInRequest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Trade-in DELETE error:", error);
    return Response.json({ error: "Failed to delete request" }, { status: 500 });
  }
}
