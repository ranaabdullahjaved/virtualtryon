import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Optimize the orders query by limiting fields and adding pagination
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
    console.error("[ORDERS_GET]", error);
    if (error.message === "Database timeout") {
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

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const body = await req.json();
    const { cart, totalAmount, shippingAddress } = body;

    if (!cart || cart.length === 0 || !totalAmount || !shippingAddress) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: parseFloat(totalAmount),
        shippingAddress: shippingAddress,
        status: "pending",
        items: {
          create: cart.map((item: any) => ({
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

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("[ORDER_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 