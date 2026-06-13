# MotoProf - PRD (Product Requirements Document)

## Problem Statement
Motosiklet yedek parça e-ticaret sitesi. Marka adı: MotoProf - Motorcycle Spare Parts.
Renk: #f97316 (turuncu). Mobil öncelikli, SEO uyumlu, Türkçe.

## Architecture
- **Frontend**: React 18 + React Router v7 + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI + MongoDB + PyJWT + bcrypt
- **Hosting**: Kubernetes pod (frontend:3000, backend:8001)

## Categories
- HONDA: PCX 125 (15-17), PCX 125 (18-20), PCX 125 (21-24), DIO 110 (21-24), CBF 150, FORZA 250, ACTIVA 125
- YAMAHA: NMAX 125, NMAX 155, XMAX 250
- CF MOTO: NK250, 250SR
- BAJAJ: NS200

## What's Been Implemented (Faz 1 — Tamamlandı)

### Backend (server.py)
- [x] JWT auth: register, login, logout, me, refresh
- [x] Products: list (filtered), detail by slug
- [x] Orders: create, list by user, detail
- [x] Auto-seed: admin user + 25 demo products on startup
- [x] MongoDB indexes

### Frontend
- [x] Anasayfa — Hero Slider (Embla) + Stats bar + Search Engine + Trust Features + Brand Cards + Featured Products + CTA Banner
- [x] Kategori Sayfası — Breadcrumb, filtre sidebar (model, marka, parça kategorisi), ürün grid, pagination
- [x] Ürün Detay — Fiyat, indirim, stok, uyumlu araç, sepete ekle
- [x] Sepet — localStorage, adet yönetimi, toplam
- [x] Checkout — Mock ödeme, sipariş oluşturma
- [x] Giriş/Kayıt — JWT cookie tabanlı auth, form validasyon
- [x] Profil — Sipariş listesi, durum badge

### Premium Design (Güncellemeler — 2025)
- [x] Cinematic hero slider (left-aligned, gradient overlays)
- [x] Stats bar (25+ ürün, 4 marka, 14 model, 100% kalite)
- [x] Glass morphism search engine with step indicators (01/02/03)
- [x] Premium product cards (shimmer hover, gradient image overlay)
- [x] Section headers with orange accent line
- [x] Glow effects on CTA buttons
- [x] Premium footer with CTA strip
- [x] CSS animations (fadeInUp, slideIn)
- [x] .glass-card, .glow-orange, .shimmer, .stripe-pattern utilities

## Test Credentials
- Admin: admin@motoprof.com / Admin123!
- Test user: kayıt formuyla oluşturulabilir

## Prioritized Backlog

### P0 — Admin Paneli (Faz 2)
- [ ] admin.motoprof.com.tr subdomain
- [ ] Ürün CRUD (ekle, düzenle, sil, resim yükleme)
- [ ] Sipariş yönetimi (durum güncelleme)
- [ ] Kullanıcı yönetimi
- [ ] Dashboard (satış istatistikleri)

### P1 — E-Ticaret Geliştirmeleri
- [x] Live search dropdown (ürün önizlemeli) ✅
- [x] Misafir checkout ✅
- [x] Çok kelimeli arama algoritması ✅
- [ ] Ödeme entegrasyonu (iyzico / PayTR)
- [ ] Kargo takip entegrasyonu
- [ ] Ürün görsel galerisi (çoklu fotoğraf)
- [ ] Stok bildirimi (e-posta)

### P2 — SEO & Performance
- [ ] react-helmet ile meta tags
- [ ] Sitemap.xml
- [ ] PWA manifest
- [ ] Lazy loading optimization
- [ ] Sosyal medya paylaşım kartları

## Next Tasks
1. Admin paneli (Faz 2) — admin.motoprof.com.tr
2. Ödeme entegrasyonu (iyzico önerilen)
3. WhatsApp numarasını gerçek numara ile güncelle (`WhatsAppButton.js` → `WHATSAPP_NUMBER`)
4. PWA manifest + service worker
