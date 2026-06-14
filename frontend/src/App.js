import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
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
import './App.css';

function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
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
              </Routes>
            </main>
            <Footer />
          </div>
          <WhatsAppButton />
          <PWAInstallBanner />
          <Toaster richColors position="top-right" closeButton />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
