import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_name: 'MotoProf', logo_url: null, favicon_url: null,
    seo_title: null, seo_description: null, seo_keywords: null,
    seo_og_title: null, seo_og_description: null, seo_og_image: null, seo_canonical: null,
    gtm_id: null, ga4_id: null, gsc_verification: null, yandex_verification: null,
    yandex_metrica_id: null, facebook_pixel_id: null, tiktok_pixel_id: null, hotjar_id: null,
    contact_phone: null, contact_email: null, contact_address: null, contact_city: null,
    working_hours: null, working_hours_weekend: null,
    social_instagram: null, social_facebook: null, social_twitter: null,
    social_youtube: null, social_tiktok: null, social_whatsapp: null, social_linkedin: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/settings`)
      .then(({ data }) => {
        setSettings(data);

        // Favicon güncelle
        if (data.favicon_url) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.favicon_url;
        }
        // Title'ı Helmet yönetiyor, burada set etmiyoruz
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) return { settings: { logo_url: null, site_name: 'MotoProf' }, loading: false };
  return ctx;
};
