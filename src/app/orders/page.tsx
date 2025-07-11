"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Package, Clock, DollarSign, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    imageUrl: string[];
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: string;
}

interface FetchError extends Error {
  name: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("/api/orders", {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(response.status === 504 ? "Request timed out" : "Failed to fetch orders");
      }
      
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (error: unknown) {
      const fetchError = error as FetchError;
      if (fetchError.name === 'AbortError') {
        setError("Request timed out. Please try again.");
      } else {
        setError("Failed to load orders. Please try again.");
      }
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch once when session is ready
  useEffect(() => {
    if (session && status === "authenticated") {
      fetchOrders();
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pt-20">
        <Card className="p-6 max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => {
              setLoading(true);
              fetchOrders();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" /> Retry
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Order History</h1>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700"></div>
            Updating...
          </div>
        )}
      </div>
      <div className="max-w-4xl mx-auto space-y-6">
        {orders.length === 0 && !loading ? (
          <Card className="p-6 text-center text-gray-500">
            No orders found. Start shopping to see your order history!
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-mono">{order.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Order Date</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Total Amount</p>
                      <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Items</p>
                      <p className="font-medium">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.imageUrl[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Shipping Address</p>
                <p className="text-sm">{order.shippingAddress}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 