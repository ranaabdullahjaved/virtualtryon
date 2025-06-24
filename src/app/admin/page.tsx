"use client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Store, Package, ClipboardList } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8 pt-32">
      <h1 className="text-4xl font-bold mb-12 text-center">Admin Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <Card
          className="flex flex-col items-center justify-center p-10 cursor-pointer hover:shadow-xl transition border-2 border-purple-100 hover:border-purple-400"
          onClick={() => router.push("/admin/brands")}
        >
          <Store className="w-16 h-16 text-purple-600 mb-4" />
          <div className="text-2xl font-bold mb-2">Add/Remove Brand</div>
          <div className="text-gray-500 text-center">Manage all brands in your store.</div>
        </Card>
        <Card
          className="flex flex-col items-center justify-center p-10 cursor-pointer hover:shadow-xl transition border-2 border-purple-100 hover:border-purple-400"
          onClick={() => router.push("/admin/products")}
        >
          <Package className="w-16 h-16 text-purple-600 mb-4" />
          <div className="text-2xl font-bold mb-2">Add/Remove Product</div>
          <div className="text-gray-500 text-center">Manage all products in your store.</div>
        </Card>
        <Card
          className="flex flex-col items-center justify-center p-10 cursor-pointer hover:shadow-xl transition border-2 border-purple-100 hover:border-purple-400"
          onClick={() => router.push("/admin/orders")}
        >
          <ClipboardList className="w-16 h-16 text-purple-600 mb-4" />
          <div className="text-2xl font-bold mb-2">Manage Orders</div>
          <div className="text-gray-500 text-center">View and update all customer orders.</div>
        </Card>
      </div>
    </div>
  );
}
