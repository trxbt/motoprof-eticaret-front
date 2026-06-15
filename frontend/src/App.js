import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useSettings } from './contexts/SettingsContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { BrandsProvider } from './contexts/BrandsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import WhatsAppButton from './components/WhatsAppButton';
import PWAInstallBanner from './components/PWAInstallBanner';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import PaymentResultPage from './pages/PaymentResultPage';
import OrderDetailPage from './pages/OrderDetailPage';
import HakkimizdaPage from './pages/HakkimizdaPage';
import SSSPage from './pages/SSSPage';
import IadePolitikasiPage from './pages/IadePolitikasiPage';
import KargoBilgisiPage from './pages/KargoBilgisiPage';
import GizlilikPolitikasiPage from './pages/GizlilikPolitikasiPage';
import KVKKPage from './pages/KVKKPage';
import CookieBanner from './components/CookieBanner';
import TrackingScripts from './components/TrackingScripts';
import './App.css';

// Global default meta — SettingsContext'ten beslenir, sayfa özel Helmet'leri override eder
const GlobalHelmet = () => {
  const { settings } = useSettings();
  return (
    <Helmet defaultTitle="MotoProf" titleTemplate="%s | MotoProf">
      {settings.seo_title && <title>{settings.seo_title}</title>}
      {settings.seo_description && <meta name="description" content={settings.seo_description} />}
      {settings.seo_keywords && <meta name="keywords" content={settings.seo_keywords} />}
      {settings.seo_canonical && <link rel="canonical" href={settings.seo_canonical} />}
      {settings.seo_og_title && <meta property="og:title" content={settings.seo_og_title} />}
      {settings.seo_og_description && <meta property="og:description" content={settings.seo_og_description} />}
      {settings.seo_og_image && <meta property="og:image" content={settings.seo_og_image} />}
    </Helmet>
  );
};

function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <BrandsProvider>
          <SettingsProvider>
          <GlobalHelmet />
          <CustomCursor />
          <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/urunler" element={<CategoryPage />} />
                <Route path="/urunler/:brand" element={<CategoryPage />} />
                <Route path="/urunler/:brand/:model" element={<CategoryPage />} />
                <Route path="/urun/:slug" element={<ProductDetailPage />} />
                <Route path="/sepet" element={<CartPage />} />
                <Route path="/odeme" element={<CheckoutPage />} />
                <Route path="/odeme-sonuc" element={<PaymentResultPage />} />
                <Route path="/giris" element={<AuthPage />} />
                <Route path="/sifremi-unuttum" element={<ForgotPasswordPage />} />
                <Route path="/sifre-sifirla" element={<ResetPasswordPage />} />
                <Route path="/favoriler" element={<WishlistPage />} />
                <Route path="/profil" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/siparislerim/:orderId" element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/hakkimizda" element={<HakkimizdaPage />} />
                <Route path="/sss" element={<SSSPage />} />
                <Route path="/iade-politikasi" element={<IadePolitikasiPage />} />
                <Route path="/kargo-bilgisi" element={<KargoBilgisiPage />} />
                <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasiPage />} />
                <Route path="/kvkk" element={<KVKKPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <WhatsAppButton />
          <PWAInstallBanner />
          <CookieBanner />
          <TrackingScripts />
          <Toaster richColors position="top-right" closeButton />
          </SettingsProvider>
          </BrandsProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
