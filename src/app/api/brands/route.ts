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
