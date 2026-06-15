import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BRANDS as STATIC_BRANDS, PARTS_CATEGORIES } from '../constants/categories';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BrandsContext = createContext(null);

export const BrandsProvider = ({ children }) => {
  const [brands, setBrands] = useState(STATIC_BRANDS);

  useEffect(() => {
    // Hem marka hem model görsellerini paralel olarak çek
    Promise.all([
      axios.get(`${API}/admin/brands`).then(r => r.data).catch(() => []),
      axios.get(`${API}/motorcycle-models`).then(r => r.data).catch(() => []),
    ]).then(([dbBrands, dbModels]) => {
      // Marka görselleri için lookup: slug -> image
      const brandImageMap = {};
      dbBrands.forEach(b => {
        if (b.image) brandImageMap[b.slug.toLowerCase()] = b.image;
      });

      // Model görselleri için lookup: slug -> image  (DB slug = statik model id)
      const modelImageMap = {};
      dbModels.forEach(m => {
        if (m.image) modelImageMap[m.slug] = m.image;
      });

      // Statik verilerle birleştir
      const merged = STATIC_BRANDS.map(brand => ({
        ...brand,
        // DB'den gelen marka görseli varsa override et
        image: brandImageMap[brand.slug] || brand.image,
        models: brand.models.map(model => {
          const dbImage = modelImageMap[model.id]; // statik id = DB slug
          return dbImage ? { ...model, image: dbImage } : model;
        }),
      }));

      setBrands(merged);
    });
  }, []);

  const getBrandBySlug = (slug) => brands.find(b => b.slug === slug);

  const getModelBySlug = (brandSlug, modelSlug) => {
    const brand = getBrandBySlug(brandSlug);
    if (!brand) return null;
    return brand.models.find(m => m.slug === modelSlug);
  };

  return (
    <BrandsContext.Provider value={{ brands, getBrandBySlug, getModelBySlug, PARTS_CATEGORIES }}>
      {children}
    </BrandsContext.Provider>
  );
};

export const useBrands = () => {
  const ctx = useContext(BrandsContext);
  if (!ctx) {
    return {
      brands: STATIC_BRANDS,
      getBrandBySlug: (slug) => STATIC_BRANDS.find(b => b.slug === slug),
      getModelBySlug: (brandSlug, modelSlug) => {
        const brand = STATIC_BRANDS.find(b => b.slug === brandSlug);
        return brand?.models.find(m => m.slug === modelSlug) || null;
      },
      PARTS_CATEGORIES,
    };
  }
  return ctx;
};
