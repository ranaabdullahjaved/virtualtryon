import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Handles fetching all products
export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { brand: true }, // Include brand info in the response
  });
  return NextResponse.json(products);
}

// Handles creating a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, imageUrl, stock, virtualTryOnFile, brandId } = body;

    // Updated validation to check for brandId
    if (!name || !price || !brandId) {
      return NextResponse.json({ error: "Missing required fields: name, price, and brandId are required." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl: imageUrl || [],
        stock: stock ? parseInt(stock) : 0,
        virtualTryOnFile,
        brandId, // Connect to the brand using the brandId
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
