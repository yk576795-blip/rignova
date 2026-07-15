import { NextRequest } from "next/server";
import prisma from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.savedBuild.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return Response.json({ error: "Build not found" }, { status: 404 });
    }

    await prisma.savedBuild.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete build:", error);
    return Response.json({ error: "Failed to delete build" }, { status: 500 });
  }
}
