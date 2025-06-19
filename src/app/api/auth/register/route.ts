import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // role: "customer" // Optional, since default is "customer"
      },
    });

    return new Response(JSON.stringify({ message: "User registered", user: { id: user.id, email: user.email } }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Registration failed" }), { status: 500 });
  }
}