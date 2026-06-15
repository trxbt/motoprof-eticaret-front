import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BRANDS as STATIC_BRANDS, PARTS_CATEGORIES } from '../constants/categories';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BrandsContext = createContext(null);

export const BrandsProvider = ({ children }) => {
  const [brands, setBrands] = useState(STATIC_BRANDS);

  useEffect(() => {
    axios.get(`${API}/motorcycle-models`)
      .then(({ data }) => {
        // DB slug matches static model id (e.g. "yamaha-nmax125")
        const dbMap = {};
        data.forEach(m => {
          dbMap[m.slug] = m;
        });

        const merged = STATIC_BRANDS.map(brand => ({
          ...brand,
          models: brand.models.map(model => {
            const dbModel = dbMap[model.id];
            if (dbModel && dbModel.image) {
              return { ...model, image: dbModel.image };
            }
            return model;
          }),
        }));

        setBrands(merged);
      })
      .catch(() => {
        // Statik verilerle devam et
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
    // Context dışında kullanılırsa fallback
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
