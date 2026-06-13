# MotoProf - PRD (Product Requirements Document)

## Problem Statement
Motosiklet yedek parça e-ticaret sitesi. Marka adı: MotoProf - Motorcycle Spare Parts.
Renk: #f97316 (turuncu). Mobil öncelikli, SEO uyumlu, Türkçe.

## Architecture
- **Frontend**: React 18 + React Router v7 + Tailwind CSS + Shadcn UI + react-helmet-async
- **Backend**: FastAPI + MongoDB + PyJWT + bcrypt
- **Hosting**: Kubernetes pod (frontend:3000, backend:8001)

## Categories
- HONDA: PCX 125 (15-17), PCX 125 (18-20), PCX 125 (21-24), DIO 110 (21-24), CBF 150, FORZA 250, ACTIVA 125
- YAMAHA: NMAX 125, NMAX 155, XMAX 250
- CF MOTO: NK250, 250SR
- BAJAJ: NS200

## What's Been Implemented

### Backend (server.py)
- [x] JWT auth: register, login, logout, me, refresh
- [x] Products: list (filtered + multi-word search by name/brand/model/sku/oem_kodu), detail by slug
- [x] Orders: create (guest + invoice + coupon support), list by user, detail
- [x] Coupons: validate endpoint (MOTO10 %10, ILKALIS %15, KARGO50 50₺ sabit, WELCOME %10)
- [x] Wishlist: GET + toggle (per-user MongoDB)
- [x] Stock notifications: subscribe endpoint (e-mail validation)
- [x] Sitemap: GET /api/sitemap.xml (dynamic, tüm ürün slug'ları)
- [x] Auto-seed: admin + 25 demo products + 4 coupons + images migration on startup

### Frontend Pages
- [x] Anasayfa — Hero Slider + Stats + SearchEngine + Brand Cards + Featured Products
- [x] Kategori Sayfası — Filtre sidebar, ürün grid, pagination
- [x] Ürün Detay — Galeri (çoklu foto + thumbnail), favorilere ekle, WhatsApp/kopyala paylaş, stok bildirimi formu, son görüntülenenler, SEO helmet
- [x] Sepet — localStorage, adet yönetimi
- [x] Checkout — Kupon kodu, fatura bilgileri, misafir checkout, mock ödeme
- [x] Favoriler Sayfası (/favoriler) — localStorage + DB sync
- [x] Giriş/Kayıt, Profil

### Components
- [x] Navbar: Live search overlay, favori kalp ikonu (badge sayı), mobil drawer menü
- [x] WishlistContext + WishlistButton (her ürün kartında kalp ikonu)
- [x] RecentlyViewed (son görüntülenen ürünler)
- [x] PWAInstallBanner (beforeinstallprompt yakalama)
- [x] CustomCursor (turuncu, sadece desktop)
- [x] WhatsAppButton (z-index 50, sepet/ödeme sayfasında gizli)
- [x] Footer: iyzico ödeme bölümü (Visa, MC, Troy, Amex, SSL, 3D Secure)

### PWA & SEO
- [x] manifest.json (theme #f97316, standalone, PNG ikonlar)
- [x] Service Worker (cache-first static, network-first API)
- [x] robots.txt (sitemap referansı)
- [x] react-helmet-async (ProductDetailPage, geliştirilecek)

### Product Fields
- sku, oem_kodu: arama algoritmasına dahil
- images[]: galeri dizisi (migration ile 3 foto/ürün)

## Test Credentials
- Admin: admin@motoprof.com / Admin123!
- Test user: /app/memory/test_credentials.md

## Demo Coupon Codes
- MOTO10: %10 indirim (min 200₺)
- ILKALIS: %15 indirim (min 0₺)
- KARGO50: 50₺ sabit indirim (min 500₺)
- WELCOME: %10 indirim (min 0₺)

## Prioritized Backlog

### P0 — Admin Paneli (Faz 2 — Ayrı Emergent Projesi)
- [ ] admin.motoprof.com.tr → ayrı Emergent projesi
- [ ] Ürün CRUD (ekle, düzenle, sil, resim yükleme)
- [ ] Sipariş yönetimi (durum güncelleme: Beklemede → Kargoya Verildi → Teslim)
- [ ] Kullanıcı yönetimi
- [ ] Dashboard (satış istatistikleri, gelir grafiği)
- [ ] Stok uyarı sistemi + stock notification tetikleyici

### P1 — Ödeme Entegrasyonu
- [ ] iyzico veya PayTR entegrasyonu (şu an mock)
- [ ] Kargo takip entegrasyonu

### P2 — SEO & UX
- [ ] react-helmet tüm sayfalara (CategoryPage, HomePage, AuthPage)
- [ ] Ürün yorumları (1-5 yıldız)
- [ ] Lazy loading optimization
- [ ] WhatsApp numarasını gerçek numara ile güncelle (WhatsAppButton.js)

## Next Tasks
1. Admin paneli (Faz 2) — ayrı Emergent projesi olarak
2. Ödeme entegrasyonu (iyzico önerilen)
3. Tüm sayfalara react-helmet SEO title/description
