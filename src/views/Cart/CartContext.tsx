// CartContext.tsx
import { createContext, useContext, useState } from 'react';

type CartItem = {
  id: number;
  name: string;
  image: string;
  price: string;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
};

const CartContext = createContext<CartCtx | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const addItem = (item: CartItem) =>
    setItems(prev => {
      const idx = prev.findIndex(p => p.id === item.id);
      if (idx > -1) {                      // đã có: tăng qty
        const copy = [...prev];
        copy[idx].qty += item.qty;
        return copy;
      }
      return [...prev, item];
    });

  return (
    <CartContext.Provider value={{ items, addItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext)!;
