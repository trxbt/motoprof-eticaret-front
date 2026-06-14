import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('motoprof_wishlist') || '[]'); }
    catch { return []; }
  });

  // Kullanıcı giriş yapınca DB ile merge et
  useEffect(() => {
    if (!user) return;
    axios.get(`${API}/wishlist`, { withCredentials: true })
      .then(({ data }) => {
        setWishlist(prev => {
          // Safe check: product_ids array varsa kullan, yoksa data'yı doğrudan array olarak oku
          const productIds = Array.isArray(data?.product_ids) ? data.product_ids : 
                            Array.isArray(data) ? data.map(item => item.product_id || item.id) :
                            [];
          const merged = [...new Set([...prev, ...productIds])];
          localStorage.setItem('motoprof_wishlist', JSON.stringify(merged));
          return merged;
        });
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    localStorage.setItem('motoprof_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggle = useCallback(async (productId) => {
    setWishlist(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      return next;
    });
    if (user) {
      axios.post(`${API}/wishlist/toggle`, { product_id: productId }, { withCredentials: true }).catch(() => {});
    }
  }, [user]);

  const isWishlisted = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWishlisted, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
