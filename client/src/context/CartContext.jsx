import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems]         = useState([]);
  const [isOpen, setIsOpen]       = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);

  // --- Add item to cart ---
  const addItem = useCallback((menuItem) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === menuItem._id);
      if (existing) {
        return prev.map(i =>
          i._id === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...menuItem, quantity: 1 }];
    });
    toast.success(`${menuItem.name} added to order`);
  }, []);

  // --- Remove one unit from cart ---
  const removeItem = useCallback((id) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === id);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter(i => i._id !== id);
      return prev.map(i => i._id === id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  }, []);

  // --- Remove item entirely ---
  const deleteItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i._id !== id));
  }, []);

  // --- Clear cart (after successful order) ---
  const clearCart = useCallback(() => {
    setItems([]);
    setIsOpen(false);
    setIsCheckout(false);
  }, []);

  // --- Computed values ---
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal  = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotal,
      isOpen,
      isCheckout,
      setIsOpen,
      setIsCheckout,
      addItem,
      removeItem,
      deleteItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook — use this anywhere in the app to access the cart
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}