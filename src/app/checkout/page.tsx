'use client';
import React, { useState } from 'react';
import { useCart } from '@/components/product/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  React.useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: session.user?.name ?? '',
        email: session.user?.email ?? '',
      }));
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          totalAmount: total.toFixed(2),
          shippingAddress: form.address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order. Please try again.');
      }

      setSubmitted(true);
      clearCart();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8">
        <Card className="max-w-lg w-full p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-green-600">Payment Successful!</h1>
          <p className="mb-6">Thank you for your order, {form.name}! A confirmation has been sent to {form.email}.</p>
          <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
          <ul className="mb-4 text-left">
            {cart.map(item => (
              <li key={item.productId} className="mb-1">{item.quantity} × {item.name} (${item.price.toFixed(2)} each)</li>
            ))}
          </ul>
          <div className="font-bold text-lg mb-2">Total Paid: ${total.toFixed(2)}</div>
          <div className="text-gray-500">Shipping to: {form.address}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8">
      <Card className="max-w-lg w-full p-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            name="address"
            placeholder="Shipping Address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
          <div className="border-t pt-4 mt-4">
            <h2 className="font-semibold mb-2">Order Summary</h2>
            <ul className="mb-2">
              {cart.map(item => (
                <li key={item.productId}>{item.quantity} × {item.name} (${item.price.toFixed(2)} each)</li>
              ))}
            </ul>
            <div className="font-bold text-lg">Total: ${total.toFixed(2)}</div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-2 rounded-lg mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </Button>
        </form>
      </Card>
    </div>
  );
} 