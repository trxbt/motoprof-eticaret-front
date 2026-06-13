import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import ProductCard from './ProductCard';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STORAGE_KEY = 'motoprof_recently_viewed';

export const trackRecentlyViewed = (slug) => {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updated = [slug, ...current.filter(s => s !== slug)].slice(0, 6);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
};

const RecentlyViewed = ({ currentSlug }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    try {
      const slugs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        .filter(s => s !== currentSlug)
        .slice(0, 4);
      if (!slugs.length) return;
      Promise.all(slugs.map(slug =>
        axios.get(`${API}/products/${slug}`).then(r => r.data).catch(() => null)
      )).then(results => setProducts(results.filter(Boolean)));
    } catch {}
  }, [currentSlug]);

  if (!products.length) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-5">
        <Clock size={14} className="text-neutral-600" />
        <div>
          <span className="section-label mb-0.5 block">Geçmiş</span>
          <h2 className="text-lg font-black text-white font-chivo tracking-tight">Son Baktıklarınız</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};

export default RecentlyViewed;
