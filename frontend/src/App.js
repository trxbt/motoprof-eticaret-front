import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import WhatsAppButton from './components/WhatsAppButton';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
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
                <Route path="/giris" element={<AuthPage />} />
                <Route path="/profil" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
          <WhatsAppButton />
          <Toaster richColors position="top-right" closeButton />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
