import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '../ui/button';
import { useCart } from '../product/CartContext';

export default function CartButton({ cartOpen, setCartOpen }: { cartOpen: boolean; setCartOpen: (open: boolean) => void }) {
  const { cart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Button
      variant="secondary"
      size="icon"
      className="fixed bottom-24 right-6 z-40 shadow-lg"
      onClick={() => setCartOpen(true)}
      aria-label="Open Cart"
    >
      <ShoppingBag className="w-7 h-7" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow">{itemCount}</span>
      )}
    </Button>
  );
} 