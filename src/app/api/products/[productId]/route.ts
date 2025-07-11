import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to extract productId from the URL
function getProductIdFromRequest(request: NextRequest): string | undefined {
  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export async function GET(request: NextRequest) {
  const productId = getProductIdFromRequest(request);

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { brand: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Handles deleting a product
export async function DELETE(request: NextRequest) {
  const productId = getProductIdFromRequest(request);
  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }
  try {
    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Handles updating product stock
export async function PATCH(request: NextRequest) {
  const productId = getProductIdFromRequest(request);
  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }
  try {
    const { stock } = await request.json();
    if (typeof stock !== "number" || stock < 0) {
      return NextResponse.json({ error: "Invalid stock value" }, { status: 400 });
    }
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { stock },
    });
    return NextResponse.json({ message: "Stock updated", product: updated });
  } catch (error) {
    console.error(`Error updating stock for product ${productId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Handles decrementing product stock by 1 (for Buy Now)
export async function POST(request: NextRequest) {
  const productId = getProductIdFromRequest(request);
  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (product.stock <= 0) {
      return NextResponse.json({ error: "Out of stock" }, { status: 400 });
    }
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { stock: product.stock - 1 },
    });
    return NextResponse.json({ message: "Stock decremented", product: updated });
  } catch (error) {
    console.error(`Error decrementing stock for product ${productId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}