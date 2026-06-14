# MotoProf — PRD

## Problem Tanımı
motoprof.com.tr için motosiklet yedek parça e-ticaret sitesi. Hedef: premium dark UI (glassmorphism), mobil-first, 100% SEO uyumlu. Honda, Yamaha, CF Moto, Bajaj markalarına özel model bazlı arama.

## Teknoloji Stack
- **Frontend**: React, TailwindCSS, Shadcn UI, Context API, PWA
- **Backend**: FastAPI + PostgreSQL (SQLAlchemy + asyncpg) — MongoDB'den migrate edildi
- **Auth**: Cookie-tabanlı JWT (HttpOnly, samesite=lax)
- **Ödeme**: iyzico sandbox entegrasyonu (gerçek API)
- **Deployment**: Docker Compose + Nginx + Coolify

## Mimari (Refaktör Edilmiş)
```
/app/
├── backend/
│   ├── server.py          # Uygulama init (ince)
│   ├── config.py          # JWT utils, bcrypt
│   ├── database.py        # SQLAlchemy engine, session
│   ├── deps.py            # Auth dependency injection
│   ├── serializers.py     # DB → dict dönüştürücüler
│   ├── seed.py            # Demo veri + admin seed
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py      # SQLAlchemy modelleri
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── schemas.py     # Pydantic şemalar
│   └── routes/
│       ├── __init__.py
│       ├── auth.py        # /auth/*
│       ├── products.py    # /products
│       ├── orders.py      # /orders
│       ├── wishlist.py    # /wishlist
│       ├── coupons.py     # /coupons
│       ├── payments.py    # /payments/iyzico/*
│       └── misc.py        # /stock-notify, /sitemap.xml
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── PaymentResultPage.js  (yeni - /odeme-sonuc)
│   │   │   └── CheckoutPage.js       (iyzico entegre)
│   │   ├── contexts/      # Auth, Cart, Wishlist
│   │   └── components/    # PWAInstallBanner, WishlistButton, RecentlyViewed
│   └── public/            # manifest.json, sw.js, icons
└── docker-compose.yml, DEPLOYMENT.md, nginx.conf
```

## DB Şeması (PostgreSQL)
- `users`: {id, email, password_hash, name, role, created_at}
- `products`: {id, slug, name, price, original_price, image, images[], brand, model, model_id, year_range, category, stock, sku, oem_kodu, is_featured}
- `orders`: {id, user_id, guest_email, total, shipping_*, status, payment_status, iyzico_token, coupon_code, discount, invoice{}}
- `order_items`: {id, order_id, product_id, product_name, product_image, price, quantity}
- `wishlists`: {id, user_id, product_id}
- `coupons`: {id, code, type(percent/fixed), value, min_order, active}
- `stock_notifications`: {id, product_id, email, notified}

## Key API Endpoints
- `GET /api/products` — paginated + search (ILIKE multi-word, SKU, OEM)
- `GET /api/products/{slug}` — ürün detayı
- `POST /api/auth/register|login|logout` — cookie-based JWT
- `GET /api/auth/me` — current user
- `POST /api/orders` — sipariş oluştur (mock/test)
- `POST /api/payments/iyzico/initialize` — iyzico CF başlat (order oluştur + iyzico)
- `POST /api/payments/iyzico/callback` — iyzico sonuç + redirect
- `POST /api/coupons/validate` — kupon doğrula
- `GET /api/wishlist` + `POST /api/wishlist/toggle`
- `POST /api/stock-notify`
- `GET /api/sitemap.xml`

## Tamamlanan Özellikler
- [x] Phase 1: Homepage, Category pages, Product Detail, Cart, Checkout, Auth (login/signup)
- [x] Brand + Model arama (Honda, Yamaha, CF Moto, Bajaj)
- [x] Multi-word regex search + OEM/SKU arama
- [x] Wishlist (Favoriler)
- [x] Kupon kodları (MOTO10, ILKALIS, KARGO50, WELCOME)
- [x] Stok bildirimi (email)
- [x] Recently Viewed (son görüntülenen ürünler)
- [x] Social Share butonları
- [x] Multi-image gallery (ürün fotoğrafları)
- [x] SEO (react-helmet + sitemap.xml + robots.txt)
- [x] PWA (manifest.json, service worker, install banner)
- [x] iyzico footer güvenlik rozetleri
- [x] MongoDB → PostgreSQL migration (SQLAlchemy + asyncpg)
- [x] server.py refaktörü (routes/models/schemas/seed.py)
- [x] **Adres Yönetimi** — Profil'de Adreslerim sekmesi, Ekle/Düzenle/Sil/Varsayılan
- [x] **Sipariş Detay Sayfası** — /siparislerim/:orderId, ürünler + ödeme özeti + teslimat
- [x] **Checkout'ta Kayıtlı Adres Seçici** — giriş yapan kullanıcıya adres otomatik doldurma
- [x] **iyzico Sandbox ödeme entegrasyonu** (gerçek iyzico API)
- [x] PaymentResultPage (/odeme-sonuc?status=success|failed)
- [x] Coolify deployment dosyaları (docker-compose.yml, Dockerfiles, nginx.conf)
- [x] CORS düzeltmesi

## Bekleyen / Gelecek Görevler
### P1 (Önemli)
- [ ] iyzico Production anahtarları ile canlıya geçiş
- [ ] Gerçek ürün kataloğu (admin panelden eklenecek)

### P2 (Gelecek Fazlar)
- [ ] Admin Paneli — ayrı Emergent projesi (bu backend'e bağlanır)
- [ ] Sipariş takip e-postası (SendGrid/SMTP)
- [ ] Müşteri hesap sayfası geliştirme (sipariş geçmişi detayı)
- [ ] Ürün yorumları + puanlama sistemi
- [ ] Google Analytics / Meta Pixel entegrasyonu

## Deployment (Coolify)
- DEPLOYMENT.md dosyasında detaylı talimatlar
- Production için iyzico_base_url: `api.iyzipay.com`
- FRONTEND_URL ve CORS_ORIGINS production URL ile güncellenmeli
