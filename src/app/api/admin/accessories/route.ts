import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const accessories = await db.product.findMany({
      where: {
        category: {
          OR: [
            { name: { contains: "Keyboards", mode: "insensitive" } },
            { name: { contains: "Mice", mode: "insensitive" } },
            { name: { contains: "Headsets", mode: "insensitive" } },
            { name: { contains: "Monitors", mode: "insensitive" } },
            { name: { contains: "Webcams", mode: "insensitive" } },
            { name: { contains: "Speakers", mode: "insensitive" } },
            { name: { contains: "Mousepads", mode: "insensitive" } },
            { name: { contains: "Microphones", mode: "insensitive" } },
            { name: { contains: "Accessories", mode: "insensitive" } },
          ]
        },
        deletedAt: null,
      },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        specs: true,
        images: { 
          select: { url: true, alt: true },
          take: 1
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(accessories);
  } catch (error) {
    console.error("Failed to fetch accessories:", error);
    return Response.json([], { status: 500 });
  }
}