import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { name: true, images: { take: 1 } } },
            },
          },
          address: {
            select: { fullName: true, city: true, state: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        user: o.user,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        subtotal: Number(o.subtotal),
        discount: Number(o.discount),
        shipping: Number(o.shipping),
        tax: Number(o.tax),
        total: Number(o.total),
        address: o.address,
        items: o.items.map((i) => ({
          id: i.id,
          name: i.name,
          sku: i.sku,
          price: Number(i.price),
          quantity: i.quantity,
          total: Number(i.total),
          image: i.product.images[0]?.url ?? null,
        })),
        createdAt: o.createdAt.toISOString(),
      })),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

const orderUpdateSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
  trackingNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PATCH(request: NextRequest) {
  // PATCH /api/admin/orders?id=xxx
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = orderUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(parsed.data.status && { status: parsed.data.status }),
        ...(parsed.data.trackingNumber !== undefined && {
          trackingNumber: parsed.data.trackingNumber,
        }),
        ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
      },
    });

    // Record status history
    if (parsed.data.status) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: parsed.data.status,
          note: `Status updated to ${parsed.data.status}`,
        },
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Admin order PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
