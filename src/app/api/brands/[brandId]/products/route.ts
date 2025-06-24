import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  const brandId = params.brandId;

  if (!brandId) {
    return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
  }

  try {
    // Find the brand to get its details
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Find all products associated with that brand
    const products = await prisma.product.findMany({
      where: { brandId: brandId },
      orderBy: { createdAt: "desc" },
    });

    // Return both the brand details and the list of products
    return NextResponse.json({ brand, products });
  } catch (error) {
    console.error(`Error fetching products for brand ${brandId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
