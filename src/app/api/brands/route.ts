import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const brands = await prisma.brand.findMany({ include: { products: false } });
  return Response.json(brands);
}