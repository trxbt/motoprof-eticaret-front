# MotoProf — Coolify Kurulum Rehberi

## Gereksinimler
- Bir VPS (en az 2 GB RAM önerilir — Ubuntu 22.04 LTS)
- Coolify kurulu olmalı
- Domain (motoprof.com.tr) VPS IP'sine yönlendirilmiş olmalı

---

## 1. Coolify Kurulumu (VPS'e)

SSH ile VPS'e bağlan ve çalıştır:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Kurulum biter, tarayıcıdan `http://VPS_IP:8000` adresine git → Coolify ayarlarını tamamla.

---

## 2. Kodu GitHub'a Yükle

Emergent'te sohbet kutusuna tıkla → **"Save to GitHub"** seçeneğini kullan.

Repo'yu **private** olarak oluştur (`.env` dosyası commit edilmeyecek ama ihtiyatlı ol).

---

## 3. Coolify'da Yeni Proje Oluştur

1. Coolify panelinde → **"New Project"** → isim ver (motoprof)
2. **"Add New Resource"** → **"Docker Compose"** seç
3. **"Git Repository"** seç → GitHub hesabını bağla → MotoProf repo'sunu seç
4. **Branch**: `main`
5. **Docker Compose Location**: `/docker-compose.yml`

---

## 4. Environment Variables Ayarla

Coolify'da kaynak ayarlarında **"Environment Variables"** sekmesine geç, şunları ekle:

| Değişken | Örnek Değer | Açıklama |
|---|---|---|
| `SITE_URL` | `https://motoprof.com.tr` | Sitenin tam URL'i |
| `JWT_SECRET` | `(rastgele 32 karakter)` | JWT imzalama anahtarı |
| `ADMIN_EMAIL` | `admin@motoprof.com` | Admin giriş e-postası |
| `ADMIN_PASSWORD` | `GucluSifre123!` | Admin giriş şifresi |

**JWT_SECRET üretmek için:**
```bash
openssl rand -hex 32
```

---

## 5. Domain Ayarla

Coolify kaynağında **"Domains"** sekmesi:
- `motoprof.com.tr` → Port `80` → Frontend servisine
- SSL: **"Let's Encrypt"** seç → otomatik HTTPS

Domain DNS ayarı (domain panelinde):
```
A  @    →  VPS_IP_ADRESI
A  www  →  VPS_IP_ADRESI
```

---

## 6. Deploy Et

**"Deploy"** butonuna bas. Coolify şunları yapar:
1. GitHub'dan kodu çeker
2. Backend Docker image'ını build eder
3. Frontend'i build eder (`REACT_APP_BACKEND_URL` inject edilir)
4. MongoDB container'ını başlatır
5. Tüm servisleri ayağa kaldırır
6. SSL sertifikası alır

Build süresi: ~3-5 dakika.

---

## 7. Kurulum Sonrası Kontrol

Tarayıcıdan `https://motoprof.com.tr` aç → site açılıyor mu?

```bash
# Backend sağlık kontrolü
curl https://motoprof.com.tr/api/

# Admin girişi testi
curl -X POST https://motoprof.com.tr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@motoprof.com","password":"GucluSifre123!"}'
```

---

## 8. Admin Paneli (Gelecekte)

Admin paneli için ayrı bir Coolify kaynağı ekleyeceksin:
- Ayrı Emergent projesini GitHub'a yükle
- Coolify'da yeni kaynak → `admin.motoprof.com.tr` domain'i ver
- `REACT_APP_BACKEND_URL=https://motoprof.com.tr` olarak ayarla
- Backend paylaşımlı çalışır

---

## Sık Karşılaşılan Sorunlar

### Site açılmıyor
```bash
# Coolify loglarını kontrol et
# Coolify Panel → Kaynak → Logs sekmesi
```

### API çalışmıyor (502 Bad Gateway)
- Backend container'ının çalıştığını kontrol et
- `mongodb` container'ının `healthy` durumda olduğunu kontrol et

### HTTPS çalışmıyor
- Domain DNS yayılması 5-30 dakika sürebilir
- Coolify → Domain → "Force SSL" aktif mi?

### Admin girişi çalışmıyor
- `ADMIN_EMAIL` ve `ADMIN_PASSWORD` env var'larının doğru set edildiğini kontrol et
- Backend'i restart et (Coolify → Restart)

---

## Güncelleme Yapmak İçin

1. Emergent'te değişiklikleri yap
2. **"Save to GitHub"** ile push et
3. Coolify → **"Redeploy"** butonuna bas

Coolify otomatik webhook ile de ayarlanabilir (kod push'ta otomatik deploy).

---

## Yedekleme

MongoDB verilerini yedekle:
```bash
# VPS'te çalıştır
docker exec motoprof-mongodb-1 mongodump --out /backup/$(date +%Y%m%d)
```

---

*MotoProf v1.0 — motoprof.com.tr*
