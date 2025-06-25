import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Handles fetching all brands
export async function GET() {
  const brands = await prisma.brand.findMany({ include: { products: false } });
  return NextResponse.json(brands);
}

// Handles creating a new brand
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, logoUrl } = body;

    if (!name || !logoUrl) {
      return NextResponse.json({ error: "Missing name or logoUrl" }, { status: 400 });
    }

    const newBrand = await prisma.brand.create({
      data: {
        name,
        logoUrl,
      },
    });

    return NextResponse.json(newBrand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Handles deleting a brand
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const brandId = url.searchParams.get("id");
    if (!brandId) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }
    // Optionally: delete all products for this brand first, or use cascade in schema
    await prisma.brand.delete({ where: { id: brandId } });
    return NextResponse.json({ message: "Brand deleted" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
