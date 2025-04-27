import React, { createContext, useState, useContext } from 'react';

// Define types for cart items
export type CartItemType = {
  id: number;
  name: string;
  price: number;
  image: string;
  color: string;
  size?: string;
  quantity: number;
};

// Define the context type
type CartContextType = {
  cartItems: CartItemType[];
  addToCart: (item: CartItemType) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

// Create the context
export const CartContext = createContext<CartContextType>({} as CartContextType);

// Create a provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  // Add an item to cart
  const addToCart = (item: CartItemType) => {
    setCartItems(prevItems => {
      // Check if the item is already in the cart
      const existingItem = prevItems.find(
        cartItem => 
          cartItem.id === item.id && 
          cartItem.color === item.color && 
          cartItem.size === item.size
      );

      if (existingItem) {
        // If it exists, update the quantity
        return prevItems.map(cartItem =>
          cartItem.id === item.id && 
          cartItem.color === item.color && 
          cartItem.size === item.size
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      } else {
        // If it doesn't exist, add new item
        return [...prevItems, item];
      }
    });
  };

  // Remove an item from cart
  const removeFromCart = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Clear the cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get total number of items
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Context value
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext); 