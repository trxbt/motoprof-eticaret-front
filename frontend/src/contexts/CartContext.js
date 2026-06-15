import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { trackCart } from '../lib/cartTracker';

const CartContext = createContext(null);
const CART_KEY = 'motoprof_cart';
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isMerged, setIsMerged] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsMerged(false);
    } else if (user && user.cart_data && Array.isArray(user.cart_data) && !isMerged) {
      setItems(prev => {
        const local = [...prev];
        const dbItems = user.cart_data;
        const mergedMap = new Map();
        
        dbItems.forEach(i => mergedMap.set(i.id, i));
        
        local.forEach(i => {
            if (mergedMap.has(i.id)) {
                mergedMap.get(i.id).quantity += i.quantity;
            } else {
                mergedMap.set(i.id, i);
            }
        });
        
        const mergedArray = Array.from(mergedMap.values());
        localStorage.setItem(CART_KEY, JSON.stringify(mergedArray));
        
        if (mergedArray.length > 0) {
            axios.post(`${API}/auth/cart`, { cart_data: mergedArray }, { withCredentials: true }).catch(() => {});
        }
        
        return mergedArray;
      });
      setIsMerged(true);
    }
  }, [user, isMerged]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    // Terk edilmiş sepet takibi
    trackCart(items, user);
    if (user && isMerged) {
        const timer = setTimeout(() => {
            axios.post(`${API}/auth/cart`, { cart_data: items }, { withCredentials: true }).catch(() => {});
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [items, user, isMerged]);

  const addItem = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeItem = (productId) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
