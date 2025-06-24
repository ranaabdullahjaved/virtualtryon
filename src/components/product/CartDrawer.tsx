import React from 'react';
import { useCart } from './CartContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { X } from 'lucide-react';

export default function CartDrawer({ open, onClose, offsetTop = false }: { open: boolean; onClose: () => void; offsetTop?: boolean }) {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={`fixed inset-0 z-50 transition ${open ? 'visible' : 'invisible pointer-events-none'}`}>
      {/* Overlay */}
      <div className={`absolute inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      {/* Drawer */}
      <div className={`absolute right-0 ${offsetTop ? 'top-20' : 'top-0'} h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b pt-6 md:pt-8">
          <span className="font-bold text-lg text-purple-700">Your Cart</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-10rem)]">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500">Your cart is empty.</div>
          ) : (
            cart.map(item => (
              <Card key={item.productId} className="flex items-center gap-4 p-3">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-gray-500">${item.price.toFixed(2)}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}>-</Button>
                    <span className="px-2">{item.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</Button>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeFromCart(item.productId)}><X /></Button>
              </Card>
            ))
          )}
        </div>
        <div className="p-4 border-t flex flex-col gap-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Button variant="destructive" onClick={clearCart} disabled={cart.length === 0}>Clear Cart</Button>
          <Button variant="default" className="w-full" disabled={cart.length === 0} onClick={() => { window.location.href = '/checkout'; }}>Checkout</Button>
        </div>
      </div>
    </div>
  );
} 