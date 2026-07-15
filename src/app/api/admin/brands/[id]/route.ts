import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const brandUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = brandUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const existing = await prisma.brand.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const data = parsed.data;
    const slug = data.name ? slugify(data.name) : undefined;

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(slug && { slug }),
        logo: data.logo,
        description: data.description,
        website: data.website,
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Admin brand PUT error:", error);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brand = await prisma.brand.findUnique({ where: { id, deletedAt: null } });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.brand.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin brand DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
