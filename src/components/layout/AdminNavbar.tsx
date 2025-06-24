"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { Store, Package, ClipboardList, LogOut, LayoutDashboard } from "lucide-react";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 shadow flex items-center justify-between px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <Link href="/admin" className={`flex items-center gap-2 font-semibold text-lg ${pathname === "/admin" ? "text-purple-700" : "text-gray-700"}`}>
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </Link>
        <Link href="/admin/brands" className={`flex items-center gap-2 font-semibold text-lg ${pathname === "/admin/brands" ? "text-purple-700" : "text-gray-700"}`}>
          <Store className="w-5 h-5" /> Brands
        </Link>
        <Link href="/admin/products" className={`flex items-center gap-2 font-semibold text-lg ${pathname === "/admin/products" ? "text-purple-700" : "text-gray-700"}`}>
          <Package className="w-5 h-5" /> Products
        </Link>
        <Link href="/admin/orders" className={`flex items-center gap-2 font-semibold text-lg ${pathname === "/admin/orders" ? "text-purple-700" : "text-gray-700"}`}>
          <ClipboardList className="w-5 h-5" /> Orders
        </Link>
      </div>
      <Button
        variant="outline"
        className="flex items-center gap-2 font-semibold text-lg text-gray-700 hover:text-red-600 border-red-200"
        onClick={async () => {
          await signOut({ redirect: true, callbackUrl: "/auth" });
          window.location.href = "/auth";
        }}
      >
        <LogOut className="w-5 h-5" /> Log Out
      </Button>
    </nav>
  );
} 