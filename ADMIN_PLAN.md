# 👑 MotoProf Admin Paneli Geliştirme Planı

Sitenizin mevcut karanlık ve turuncu (Dark/Orange) temasına tamamen sadık kalarak, siparişlerinizi ve ürünlerinizi çok hızlı bir şekilde yönetebileceğiniz yepyeni bir Admin Paneli projesi (`motoprof-admin`) inşa edeceğiz.

## ❓ Açık Sorular (Open Questions)

> [!IMPORTANT]
> Admin paneli için tamamen ayrı bir React projesi (`motoprof-admin`) oluşturacağım. Bu projeyi de tıpkı ana site gibi Coolify üzerinden ayrı bir uygulama (Örn: `admin.motoprof.com.tr`) olarak yayına alabileceksiniz. Bu mimari sizin için uygun mu?

## 🛠️ Yapılacak Değişiklikler (Proposed Changes)

### 1. Mevcut Backend (FastAPI) Güncellemeleri

Admin panelinin verileri güvenli bir şekilde çekebilmesi için mevcut API'nize "Sadece Yöneticiler (Admin)" erişimli yeni rotalar ekleyeceğiz.

#### [NEW] `backend/routes/admin.py`
Bu dosyada şu yetkili işlemler olacak:
- `GET /api/admin/stats`: Toplam ciro, bekleyen sipariş sayısı, kayıtlı üye sayısı gibi "Genel Bakış" verilerini getirecek.
- `GET /api/admin/orders`: Tüm siparişleri listeleyecek.
- `PATCH /api/admin/orders/{id}`: Havale onaylama ("mock_paid" yapma) veya kargo durumunu "Kargolandı" olarak güncelleme işlemlerini yapacak.
- `POST/PUT/DELETE /api/admin/products`: Yeni motor parçası/ürün ekleme, stok/fiyat güncelleme veya ürünü yayından kaldırma işlemlerini yapacak.
- `POST/PUT/DELETE /api/admin/coupons`: İndirim kuponu oluşturma ve yönetme.
- `POST/PUT/DELETE /api/admin/banks`: Havale/EFT için banka hesap bilgilerini yönetme.
- `GET /api/admin/stock-notifications`: "Stok gelince haber ver" diyen müşterileri listeleme ve onlara toplu e-posta atma.

#### [MODIFY] `backend/deps.py`
Mevcut JWT token doğrulama sistemine `get_admin_user` adında yeni bir koruma (dependency) eklenecek. Böylece normal bir müşteri yetkisiz bir şekilde Admin API'lerine istek atamayacak.

---

### 2. Yeni Frontend Projesi: `motoprof-admin`

Mevcut klasörünüzün yanına yepyeni bir React projesi (`Vite + TailwindCSS + Lucide Icons`) kuracağım. Tasarım tamamen sitenizin siyah/turuncu elit hissiyatına uygun olacak.

#### Sayfa ve Özellik Dağılımı:

**🔒 1. Giriş Ekranı (Login)**
- Sadece `role="admin"` olan kullanıcıların girebileceği, şık bir giriş ekranı. (Varsayılan olarak `admin@motoprof.com` hesabınızla gireceksiniz).

**📊 2. Dashboard (Genel Bakış)**
- Üstte 4 büyük kutu: "Aylık Ciro", "Toplam Sipariş", "Bekleyen Havaleler", "Toplam Üye".
- Ortada son gelen 5 siparişin hızlı görünümü.

**📦 3. Sipariş Yönetimi (Orders)**
- Tüm siparişleri bir tablo halinde görme.
- Duruma göre filtreleme (Bekleyen Havale, Hazırlanıyor, Kargolandı, Teslim Edildi, İptal).
- Sipariş detayına girip müşterinin kargo adresini, faturasını ve aldığı ürünleri görüntüleme.
- Durum güncelleme (Örn: Havale geldiğinde tek tıkla "Ödendi" durumuna alma).

**🏍️ 4. Ürün Yönetimi (Products)**
- Mevcut ürünleri listeleme.
- Yeni Ürün Ekleme (Resim URL, İsim, Fiyat, Stok, Marka/Kategori).
- Fiyat/Stok güncelleme.

**🎟️ 5. Kampanya ve Kupon Yönetimi (Coupons)**
- Yüzdelik (`%10 İndirim`) veya Sabit Tutar (`100 TL İndirim`) kuponları oluşturma.
- Kupon kullanım limitleri ve aktif/pasif durumu ayarlama.

**🏦 6. Banka Hesapları Yönetimi (Bank Accounts)**
- Havale/EFT ile ödeme yapan müşterilerin göreceği banka hesaplarını ve IBAN'ları sistem üzerinden kolayca ekleyip çıkarma.

**🔔 7. Stok Bildirimleri Yönetimi (Notifications)**
- Hangi ürün için kaç kişinin stok beklediğini görme.
- Stok eklendiği anda o müşterilere tek tıkla "Ürün Stokta!" e-postası gönderme.

**👥 8. Müşteri Yönetimi (Users)**
- Kayıtlı üyeleri listeleme, sipariş geçmişlerini inceleme.

**📁 9. Kategori ve Marka Yönetimi (Categories & Brands)**
- Kodlara dokunmadan yeni motosiklet markaları ve ekipman kategorileri ekleyebilme.

**🖨️ 10. Kargo ve Fatura Çıktısı Alma (Print)**
- Siparişe tıklandığında otomatik olarak kargo poşetine yapıştırılacak kargo barkodunu / fişini ve müşterinin e-faturasını A4 veya termal yazıcı formatında yazdırma.

**📈 11. Excel'e Aktarma (Export)**
- Siparişleri ve müşteri datalarını muhasebe için tek tıkla Excel/CSV olarak indirme.

**🖼️ 12. S3 Uyumlu Görsel Yükleme (Object Storage)**
- Ürün fotoğraflarını dışarıdan link (URL) olarak girmek yerine, bilgisayardan veya telefondan seçip doğrudan kendi S3 sunucunuza (SeaweedFS veya Garage) yükleme altyapısı. Backend (FastAPI), dosyayı alıp S3 sunucunuza aktaracak ve oradan yüksek hızla sitenize sunacak.

## 🧪 Doğrulama Planı (Verification Plan)
1. Yeni `motoprof-admin` projesi oluşturulacak ve çalıştırılacak.
2. `admin@motoprof.com` şifresiyle giriş yapılabildiği doğrulanacak.
3. Dashboard üzerinde verilerin düzgün yüklendiği görülecek.
4. Yeni bir test ürünü eklenip ana sitede göründüğü teyit edilecek.
5. Ana siteden verilen bir siparişin, admin panelinden durumunun (Ödendi -> Kargolandı) güncellenebildiği test edilecek.
