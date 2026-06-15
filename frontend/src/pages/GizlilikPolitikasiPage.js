import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-base font-black text-white mb-3">{title}</h2>
    <div className="text-sm text-neutral-400 leading-relaxed space-y-2">{children}</div>
  </div>
);

const GizlilikPolitikasiPage = () => (
  <div className="min-h-screen bg-[#060606] pt-24 pb-20">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-[10px] text-neutral-600 mb-10 uppercase tracking-widest">
        <Link to="/" className="hover:text-orange-400 transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-neutral-400">Gizlilik Politikası</span>
      </div>
      <h1 className="text-3xl font-black text-white mb-2">Gizlilik Politikası</h1>
      <div className="w-12 h-0.5 bg-orange-500 mb-3" />
      <p className="text-xs text-neutral-600 mb-10">Son güncelleme: Ocak 2025</p>

      <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-7">
        <Section title="1. Veri Sorumlusu">
          <p>İşbu Gizlilik Politikası, MotoProf E-Ticaret A.Ş. tarafından hazırlanmıştır. Kişisel verilerinizin işlenmesine ilişkin her türlü soru ve talepleriniz için <a href="mailto:kvkk@motoprof.com.tr" className="text-orange-400 hover:text-orange-300">kvkk@motoprof.com.tr</a> adresine ulaşabilirsiniz.</p>
        </Section>
        <Section title="2. Toplanan Veriler">
          <p>Sitemizi kullandığınızda aşağıdaki veriler toplanabilir:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-neutral-500">
            <li>Ad, soyad, e-posta adresi, telefon numarası</li>
            <li>Teslimat ve fatura adresleri</li>
            <li>Sipariş geçmişi ve ödeme bilgileri (kart numarası saklanmaz)</li>
            <li>IP adresi, tarayıcı türü, ziyaret edilen sayfalar</li>
            <li>Çerez verileri</li>
          </ul>
        </Section>
        <Section title="3. Verilerin Kullanım Amacı">
          <ul className="list-disc list-inside space-y-1 text-neutral-500">
            <li>Sipariş ve teslimat işlemlerinin yürütülmesi</li>
            <li>Müşteri hizmetleri ve teknik destek sağlanması</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (fatura, vergi, KVKK)</li>
            <li>Açık rıza verilmesi halinde pazarlama ve kampanya bildirimleri</li>
          </ul>
        </Section>
        <Section title="4. Veri Güvenliği">
          <p>Kişisel verileriniz SSL/TLS şifrelemesi ile korunmakta olup yetkisiz erişime karşı teknik ve idari tedbirler alınmaktadır. Ödeme bilgileriniz PCI-DSS uyumlu ödeme altyapısı aracılığıyla işlenir; kartınızın tam numarası sistemlerimizde saklanmaz.</p>
        </Section>
        <Section title="5. Üçüncü Taraflarla Paylaşım">
          <p>Verileriniz; kargo firmalarına teslimat için, ödeme altyapı sağlayıcısına işlem için ve yasal zorunluluk halinde yetkili kamu kuruluşlarıyla paylaşılır. Rızanız olmaksızın üçüncü taraflara pazarlama amacıyla aktarılmaz.</p>
        </Section>
        <Section title="6. Çerezler">
          <p>Sitemiz oturum yönetimi, kullanıcı deneyimi iyileştirme ve istatistiksel analiz amaçlı çerezler kullanmaktadır. Çerez tercihlerinizi tarayıcınız aracılığıyla ya da site girişinde görüntülenen çerez yönetim panelinden düzenleyebilirsiniz.</p>
        </Section>
        <Section title="7. Haklarınız">
          <p>6698 sayılı KVKK kapsamında kişisel verilerinize ilişkin; erişim, düzeltme, silme, işlemenin kısıtlanması ve veri taşınabilirliği haklarına sahipsiniz. Bu hakları kullanmak için <a href="mailto:kvkk@motoprof.com.tr" className="text-orange-400 hover:text-orange-300">kvkk@motoprof.com.tr</a> adresine başvurabilirsiniz.</p>
        </Section>
      </div>
    </div>
  </div>
);

export default GizlilikPolitikasiPage;
