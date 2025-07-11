"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
  }, [status, router]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      setOrders(await res.json());
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (session) fetchOrders(); }, [session]);

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdating(orderId);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setSuccess("Order status updated!");
      fetchOrders();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  if (status === "loading" || loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 pt-20">
      <h1 className="text-3xl font-bold mb-8">Order Management</h1>
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <div className="space-y-8">
        {orders.map(orderRaw => {
          // Add a type guard for order
          if (
            typeof orderRaw !== "object" || orderRaw === null ||
            !("id" in orderRaw) || !("user" in orderRaw) || !("items" in orderRaw) || !("totalAmount" in orderRaw) || !("shippingAddress" in orderRaw) || !("status" in orderRaw) || !("createdAt" in orderRaw)
          ) return null;
          const order = orderRaw as {
            id: string;
            user?: { name?: string; email?: string };
            items: Array<{ id: string; product: { imageUrl: string[]; name: string }; quantity: number; price: number }>;
            totalAmount: number;
            shippingAddress: string;
            status: string;
            createdAt: string;
          };
          return (
            <Card key={order.id} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-sm text-gray-500">Order ID</div>
                  <div className="font-mono text-lg">{order.id}</div>
                  <div className="text-sm text-gray-500">User: {order.user?.name || order.user?.email}</div>
                </div>
                <div>
                  <select
                    className="border rounded px-2 py-1"
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    disabled={updating === order.id}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold mb-2">Items</div>
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.product.imageUrl[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="mb-2"><span className="font-semibold">Total:</span> ${order.totalAmount.toFixed(2)}</div>
                  <div className="mb-2"><span className="font-semibold">Shipping:</span> {order.shippingAddress}</div>
                  <div className="mb-2"><span className="font-semibold">Status:</span> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</div>
                  <div className="mb-2"><span className="font-semibold">Placed:</span> {new Date(order.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 