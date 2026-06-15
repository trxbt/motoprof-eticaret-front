import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-base font-black text-white mb-3">{title}</h2>
    <div className="text-sm text-neutral-400 leading-relaxed space-y-2">{children}</div>
  </div>
);

const KVKKPage = () => (
  <div className="min-h-screen bg-[#060606] pt-24 pb-20">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-[10px] text-neutral-600 mb-10 uppercase tracking-widest">
        <Link to="/" className="hover:text-orange-400 transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-neutral-400">KVKK</span>
      </div>
      <h1 className="text-3xl font-black text-white mb-2">KVKK Aydınlatma Metni</h1>
      <div className="w-12 h-0.5 bg-orange-500 mb-3" />
      <p className="text-xs text-neutral-600 mb-10">6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanmıştır. Son güncelleme: Ocak 2025</p>

      <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-7">
        <Section title="1. Veri Sorumlusu">
          <p>MotoProf E-Ticaret A.Ş. (bundan sonra "MotoProf" olarak anılacaktır) olarak kişisel verilerinizi 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") çerçevesinde işlemekteyiz.</p>
          <p><strong className="text-white">Adres:</strong> İstanbul, Türkiye<br /><strong className="text-white">E-posta:</strong> <a href="mailto:kvkk@motoprof.com.tr" className="text-orange-400 hover:text-orange-300">kvkk@motoprof.com.tr</a></p>
        </Section>
        <Section title="2. İşlenen Kişisel Veriler">
          <ul className="list-disc list-inside space-y-1 text-neutral-500">
            <li><strong className="text-neutral-300">Kimlik verileri:</strong> Ad, soyad</li>
            <li><strong className="text-neutral-300">İletişim verileri:</strong> E-posta, telefon, adres</li>
            <li><strong className="text-neutral-300">İşlem verileri:</strong> Sipariş, ödeme ve fatura bilgileri</li>
            <li><strong className="text-neutral-300">Teknik veriler:</strong> IP adresi, çerez verileri, oturum bilgileri</li>
          </ul>
        </Section>
        <Section title="3. İşleme Amaçları ve Hukuki Dayanaklar">
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-neutral-600 uppercase tracking-wider py-2 pr-4">Amaç</th>
                  <th className="text-left text-neutral-600 uppercase tracking-wider py-2">Hukuki Dayanak</th>
                </tr>
              </thead>
              <tbody className="text-neutral-500">
                {[
                  ['Sipariş ve teslimat yönetimi', 'Sözleşmenin ifası (m.5/2-c)'],
                  ['Fatura ve vergi yükümlülükleri', 'Kanuni yükümlülük (m.5/2-ç)'],
                  ['Müşteri hizmetleri', 'Meşru menfaat (m.5/2-f)'],
                  ['Pazarlama ve kampanya bildirimleri', 'Açık rıza (m.5/1)'],
                  ['Güvenlik ve dolandırıcılık önleme', 'Meşru menfaat (m.5/2-f)'],
                ].map(([amaç, dayanak]) => (
                  <tr key={amaç} className="border-b border-white/3">
                    <td className="py-2.5 pr-4">{amaç}</td>
                    <td className="py-2.5">{dayanak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="4. Veri Saklama Süreleri">
          <p>Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal zorunluluklar çerçevesinde saklanır. Sipariş ve fatura verileri vergi mevzuatı gereği <strong className="text-white">10 yıl</strong> boyunca tutulur.</p>
        </Section>
        <Section title="5. Veri Aktarımı">
          <p>Verileriniz yalnızca hizmet alınan kargo şirketlerine, ödeme altyapı sağlayıcısına ve yasal zorunluluk halinde kamu kurumlarına aktarılmaktadır. Yurt dışına aktarım yapılmamaktadır.</p>
        </Section>
        <Section title="6. İlgili Kişi Hakları (KVKK Madde 11)">
          <ul className="list-disc list-inside space-y-1 text-neutral-500">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse bilgi talep etme</li>
            <li>Amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içi veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmiş ise düzeltilmesini isteme</li>
            <li>Silinmesini veya yok edilmesini isteme</li>
            <li>Düzeltme, silme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme</li>
            <li>Münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize sonuç doğurmasına itiraz etme</li>
            <li>Kanuna aykırı işlenmesi sebebiyle zarara uğraması halinde zararın giderilmesini talep etme</li>
          </ul>
        </Section>
        <Section title="7. Başvuru Yöntemi">
          <p>Haklarınızı kullanmak için <a href="mailto:kvkk@motoprof.com.tr" className="text-orange-400 hover:text-orange-300">kvkk@motoprof.com.tr</a> adresine kimliğinizi doğrulayan bilgilerle yazılı başvuruda bulunabilirsiniz. Başvurularınız en geç <strong className="text-white">30 gün</strong> içinde sonuçlandırılır.</p>
        </Section>
      </div>
    </div>
  </div>
);

export default KVKKPage;
