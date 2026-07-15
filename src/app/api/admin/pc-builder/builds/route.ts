import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const savedBuilds = await db.savedBuild.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        user: { 
          select: { 
            name: true, 
            email: true 
          } 
        },
        items: {
          include: {
            component: {
              select: {
                name: true,
                price: true,
                category: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total price for each build
    const buildsWithTotals = savedBuilds.map(build => ({
      ...build,
      totalPrice: build.items.reduce((total, item) => 
        total + (Number(item.component.price) * item.quantity), 0
      )
    }));

    return Response.json(buildsWithTotals);
  } catch (error) {
    console.error("Failed to fetch saved builds:", error);
    return Response.json([], { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return Response.json({ error: "Build ID required" }, { status: 400 });
    }

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