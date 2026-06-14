# MotoProf — Coolify Deployment Rehberi

## Önkoşullar
- VPS (min 2 GB RAM, Ubuntu 22.04 LTS)
- Coolify kurulu (`http://VPS_IP:8000` erişilebilir olmalı)
- `motoprof.com.tr` DNS → VPS IP'sine yönlendirilmiş

---

## 1. Coolify Kurulumu (henüz kurulu değilse)

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

---

## 2. Kodu GitHub'a Yükle

Emergent chat kutusunda → **"Save to GitHub"** → Private repo oluştur.

---

## 3. Coolify'da Proje Oluştur

1. **"New Project"** → İsim: `motoprof`
2. **"New Resource"** → **"Docker Compose"** seç
3. **"Git Repository"** → GitHub'ı bağla → Repo'yu seç
4. **Branch:** `main` | **Compose Dosyası:** `/docker-compose.yml`

---

## 4. Environment Variables Ekle

Coolify → Kaynak → **"Environment Variables"** sekmesi:

| Değişken | Açıklama | Örnek |
|---|---|---|
| `SITE_URL` | Sitenin tam URL'i | `https://motoprof.com.tr` |
| `POSTGRES_PASSWORD` | PostgreSQL şifresi | `Gucl#P@ss2024` |
| `JWT_SECRET` | JWT imzalama anahtarı | `openssl rand -hex 32` ile üret |
| `ADMIN_EMAIL` | Admin giriş e-postası | `admin@motoprof.com` |
| `ADMIN_PASSWORD` | Admin giriş şifresi | `Admin#2024!` |
| `IYZICO_API_KEY` | iyzico API anahtarı | Production anahtarın |
| `IYZICO_SECRET_KEY` | iyzico Secret anahtarı | Production secret'ın |
| `IYZICO_BASE_URL` | iyzico endpoint | `api.iyzipay.com` |

> **JWT_SECRET üretmek için:**
> ```bash
> openssl rand -hex 32
> ```

> **iyzico Production anahtarları:** https://merchant.iyzipay.com → Settings → API Keys

---

## 5. Domain Ayarla

Coolify → Kaynak → **"Domains"** sekmesi:
- Domain: `motoprof.com.tr`
- Port: `80`
- **"Let's Encrypt"** → Otomatik HTTPS ✓

DNS (domain panelinde):
```
A  @    →  VPS_IP
A  www  →  VPS_IP
```

---

## 6. Deploy Et

**"Deploy"** butonuna bas. Coolify:
1. GitHub'dan kodu çeker
2. PostgreSQL container'ını başlatır
3. Backend image'ını build eder (FastAPI + SQLAlchemy)
4. Frontend'i build eder (`REACT_APP_BACKEND_URL` inject edilir)
5. Nginx'i başlatır
6. SSL sertifikası alır (~3-5 dakika)

---

## 7. Kurulum Sonrası Kontrol

```bash
# Backend sağlık
curl https://motoprof.com.tr/api/
# Beklenen: {"message":"MotoProf API çalışıyor","db":"postgresql","version":"2.1.0"}

# Admin girişi
curl -X POST https://motoprof.com.tr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@motoprof.com","password":"Admin#2024!"}'
```

---

## 8. İlk Deployment Sonrası Otomatik

- Admin kullanıcı otomatik oluşturulur
- 25 demo ürün eklenir (gerçek ürünler admin panelden eklenecek)
- Demo kuponlar aktif olur: `MOTO10`, `ILKALIS`, `KARGO50`, `WELCOME`
- Tüm PostgreSQL tabloları otomatik oluşturulur

---

## 9. iyzico Production Geçişi

Sandbox'tan production'a geçmek için sadece env var'ları değiştir:

| Değişken | Sandbox | Production |
|---|---|---|
| `IYZICO_API_KEY` | `sandbox-xxx` | Production key |
| `IYZICO_SECRET_KEY` | `sandbox-xxx` | Production secret |
| `IYZICO_BASE_URL` | `sandbox-api.iyzipay.com` | `api.iyzipay.com` |

Coolify → Kaynak → Environment Variables → Değiştir → **Redeploy**

---

## 10. Admin Paneli (Gelecekte)

Ayrı Emergent projesi olarak geliştirilecek:
- Coolify'da yeni kaynak: `admin.motoprof.com.tr`
- `REACT_APP_BACKEND_URL=https://motoprof.com.tr` olarak ayarla

---

## Güncelleme

1. Emergent'te değişiklik yap → **"Save to GitHub"**
2. Coolify → **"Redeploy"**

Otomatik deploy için: Coolify → Webhooks → GitHub webhook ekle

---

## Veritabanı Yedeği

```bash
# VPS'te çalıştır
docker exec motoprof-postgres-1 pg_dump -U motoprof motoprof > backup_$(date +%Y%m%d).sql
```

---

## Sık Sorunlar

| Sorun | Çözüm |
|---|---|
| `502 Bad Gateway` | Backend container loglarına bak: Coolify → Logs |
| `DB bağlantı hatası` | `POSTGRES_PASSWORD` değişkenini kontrol et |
| `iyzico hatası` | `IYZICO_BASE_URL`'in `https://` içermediğini kontrol et |
| HTTPS çalışmıyor | DNS yayılması 5-30 dk sürebilir |
| Admin girişi çalışmıyor | `ADMIN_EMAIL` / `ADMIN_PASSWORD` env var kontrol et, sonra Redeploy |

---

*MotoProf v2.1 — PostgreSQL + iyzico — motoprof.com.tr*
