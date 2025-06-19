import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, price, imageUrl, category, stock, virtualTryOnFile } = body;

  if (!name || !price || !category) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      imageUrl: imageUrl || [],
      category,
      stock: stock ? parseInt(stock) : 0,
      virtualTryOnFile,
    },
  });

  return Response.json(product, { status: 201 });
}