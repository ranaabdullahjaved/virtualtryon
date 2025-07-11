"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { useCart } from "../product/CartContext";
import { ShoppingBag, LogOut, History, Store, User } from "lucide-react";

const Navbar = ({ cartOpen, setCartOpen }: { cartOpen: boolean; setCartOpen: (open: boolean) => void }) => {
  const pathname = usePathname();
  const { cart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (pathname === "/auth") {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 shadow flex items-center justify-between px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <Link href="/brands" className={`flex items-center gap-2 font-semibold text-lg ${pathname.startsWith("/brands") ? "text-purple-700" : "text-gray-700"}`}>
          <Store className="w-5 h-5" /> Brands
        </Link>
        <Link href="/orders" className={`flex items-center gap-2 font-semibold text-lg ${pathname.startsWith("/orders") ? "text-purple-700" : "text-gray-700"}`}>
          <History className="w-5 h-5" /> Order History
        </Link>
        <button
          className="relative flex items-center gap-2 font-semibold text-lg text-gray-700 hover:text-purple-700 focus:outline-none"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag className="w-5 h-5" /> View Cart
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow">{itemCount}</span>
          )}
        </button>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/profile" className={`flex items-center gap-2 font-semibold text-lg ${pathname === "/profile" ? "text-purple-700" : "text-gray-700"}`}>
          <User className="w-5 h-5" /> Profile
        </Link>
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
      </div>
    </nav>
  );
};

export default Navbar; 