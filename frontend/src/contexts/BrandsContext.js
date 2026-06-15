import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BRANDS as STATIC_BRANDS, PARTS_CATEGORIES } from '../constants/categories';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BrandsContext = createContext(null);

export const BrandsProvider = ({ children }) => {
  const [brands, setBrands] = useState(STATIC_BRANDS);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/admin/brands`).then(r => r.data).catch(() => []),
      axios.get(`${API}/motorcycle-models`).then(r => r.data).catch(() => []),
      axios.get(`${API}/categories`).then(r => r.data).catch(() => []),
    ]).then(([dbBrands, dbModels, dbCategories]) => {

      // Marka: slug -> DB marka objesi
      const brandMap = {};
      dbBrands.forEach(b => { brandMap[b.slug.toLowerCase()] = b; });

      // Model: slug -> DB model objesi  (DB slug = statik model id)
      const modelMap = {};
      dbModels.forEach(m => { modelMap[m.slug] = m; });

      // Markaları birleştir (görsel + SEO)
      const merged = STATIC_BRANDS.map(brand => {
        const db = brandMap[brand.slug];
        return {
          ...brand,
          image: db?.image || brand.image,
          seo_title: db?.seo_title || null,
          seo_description: db?.seo_description || null,
          seo_keywords: db?.seo_keywords || null,
          models: brand.models.map(model => {
            const dbM = modelMap[model.id];
            if (!dbM) return model;
            return {
              ...model,
              image: dbM.image || model.image,
              seo_title: dbM.seo_title || null,
              seo_description: dbM.seo_description || null,
              seo_keywords: dbM.seo_keywords || null,
            };
          }),
        };
      });

      setBrands(merged);
      setCategories(dbCategories);
    });
  }, []);

  const getBrandBySlug = (slug) => brands.find(b => b.slug === slug);

  const getModelBySlug = (brandSlug, modelSlug) => {
    const brand = getBrandBySlug(brandSlug);
    if (!brand) return null;
    return brand.models.find(m => m.slug === modelSlug);
  };

  const getCategoryBySlug = (slug) => categories.find(c => c.slug === slug);

  return (
    <BrandsContext.Provider value={{ brands, categories, getBrandBySlug, getModelBySlug, getCategoryBySlug, PARTS_CATEGORIES }}>
      {children}
    </BrandsContext.Provider>
  );
};

export const useBrands = () => {
  const ctx = useContext(BrandsContext);
  if (!ctx) {
    return {
      brands: STATIC_BRANDS,
      categories: [],
      getBrandBySlug: (slug) => STATIC_BRANDS.find(b => b.slug === slug),
      getModelBySlug: (brandSlug, modelSlug) => {
        const brand = STATIC_BRANDS.find(b => b.slug === brandSlug);
        return brand?.models.find(m => m.slug === modelSlug) || null;
      },
      getCategoryBySlug: () => null,
      PARTS_CATEGORIES,
    };
  }
  return ctx;
};
