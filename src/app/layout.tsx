// src/app/layout.tsx
"use client";
import './globals.css';
import { SessionProvider, useSession } from "next-auth/react";
import type { ReactNode } from "react";
import ChatbotButton from "@/components/chatbot/ChatbotButton";
import { CartProvider } from "@/components/product/CartContext";
import CartButton from "@/components/layout/CartButton";
import Navbar from "@/components/layout/Navbar";
import { useState } from "react";
import CartDrawer from "@/components/product/CartDrawer";
import { usePathname } from "next/navigation";
import AdminNavbar from "@/components/layout/AdminNavbar";

// Wrapper component to handle authenticated components
function AuthenticatedComponents({ cartOpen, setCartOpen }: { cartOpen: boolean; setCartOpen: (open: boolean) => void }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Show admin navbar on /admin routes if user is admin
  if (pathname.startsWith("/admin") && session?.user?.role === "admin") {
    return <AdminNavbar />;
  }

  // Don't show authenticated components on these routes
  const publicRoutes = ['/', '/auth'];
  if (publicRoutes.includes(pathname) || status !== "authenticated") {
    return null;
  }

  return (
    <>
      <Navbar cartOpen={cartOpen} setCartOpen={setCartOpen} />
      <CartButton cartOpen={cartOpen} setCartOpen={setCartOpen} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <ChatbotButton />
    </>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <CartProvider>
            <AuthenticatedComponents cartOpen={cartOpen} setCartOpen={setCartOpen} />
            {children}
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}