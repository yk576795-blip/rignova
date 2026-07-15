import { NextRequest } from "next/server";
import prisma from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const savedBuilds = await prisma.savedBuild.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: { name: true, email: true },
        },
        items: {
          include: {
            component: {
              select: {
                name: true,
                price: true,
                type: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(
      savedBuilds.map((build) => ({
        id: build.id,
        name: build.name,
        totalPrice: Number(build.totalPrice),
        isPublic: build.isPublic,
        createdAt: build.createdAt.toISOString(),
        user: build.user
          ? { name: build.user.name, email: build.user.email }
          : { name: "Guest", email: "—" },
        items: build.items.map((item) => ({
          quantity: item.quantity,
          component: {
            name: item.component.name,
            price: Number(item.component.price),
            category: { name: item.component.type.name },
          },
        })),
      }))
    );
  } catch (error) {
    console.error("Failed to fetch saved builds:", error);
    return Response.json([], { status: 500 });
  }
}
