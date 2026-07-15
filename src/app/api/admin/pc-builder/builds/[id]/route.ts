import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.savedBuild.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete build:", error);
    return Response.json({ error: "Failed to delete build" }, { status: 500 });
  }
}