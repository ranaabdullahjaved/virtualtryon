import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Add a timeout to the database query
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database timeout")), 5000)
    );

    const queryPromise = prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }, // Only select the id field
    });

    const user = await Promise.race([timeoutPromise, queryPromise]);

    if (!user || typeof user !== "object" || user === null || !("id" in user) || typeof user.id !== "string") {
      return new NextResponse("User not found", { status: 404 });
    }

    // Now TypeScript knows user.id exists and is a string
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        shippingAddress: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to 10 most recent orders
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.message === "Database timeout") {
      return new NextResponse("Request timeout", { status: 504 });
    }
    return new NextResponse("Internal error", { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || typeof user !== 'object' || user === null || !('id' in user) || typeof user.id !== 'string') {
      return new NextResponse("User not found", { status: 404 });
    }

    const body = await req.json();
    const { cart, totalAmount, shippingAddress } = body;

    if (!cart || cart.length === 0 || !totalAmount || !shippingAddress) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check stock for all products first
    for (const item of cart as Array<{ productId: string; quantity: number; name: string }>) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        return new NextResponse(`Insufficient stock for ${item.name}`, { status: 400 });
      }
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: parseFloat(totalAmount),
        shippingAddress: shippingAddress,
        status: "pending",
        items: {
          create: (cart as Array<{ productId: string; quantity: number; price: number }>).map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Decrement stock for each product
    for (const item of cart as Array<{ productId: string; quantity: number }>) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[ORDER_POST]", error.message);
    } else {
      console.error("[ORDER_POST]", error);
    }
    return new NextResponse("Internal error", { status: 500 });
  }
} 