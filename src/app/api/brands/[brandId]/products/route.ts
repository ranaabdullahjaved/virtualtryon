import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Extract brandId from the URL path
  const url = new URL(request.url);
  // Assumes route: /api/brands/[brandId]/products
  const segments = url.pathname.split("/");
  const brandId = segments[segments.length - 2];

  if (!brandId) {
    return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
  }

  try {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { brandId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ brand, products });
  } catch (error) {
    console.error(`Error fetching products for brand ${brandId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}