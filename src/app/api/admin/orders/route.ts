import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch all orders (admin only)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, imageUrl: true } } } },
    },
  });
  return NextResponse.json(orders);
}

// PATCH: Update order status (admin only)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const { orderId, status } = await req.json();
  if (!orderId || !status) {
    return new NextResponse("Missing orderId or status", { status: 400 });
  }
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  return NextResponse.json(updated);
} 