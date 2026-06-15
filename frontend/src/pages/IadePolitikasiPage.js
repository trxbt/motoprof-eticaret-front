import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-base font-black text-white mb-3">{title}</h2>
    <div className="text-sm text-neutral-400 leading-relaxed space-y-2">{children}</div>
  </div>
);

const IadePolitikasiPage = () => (
  <div className="min-h-screen bg-[#060606] pt-24 pb-20">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-[10px] text-neutral-600 mb-10 uppercase tracking-widest">
        <Link to="/" className="hover:text-orange-400 transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-neutral-400">İade Politikası</span>
      </div>
      <h1 className="text-3xl font-black text-white mb-2">İade Politikası</h1>
      <div className="w-12 h-0.5 bg-orange-500 mb-3" />
      <p className="text-xs text-neutral-600 mb-10">Son güncelleme: Ocak 2025</p>

      <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-7">
        <Section title="1. İade Hakkı">
          <p>Tüketici mevzuatı kapsamında, satın aldığınız ürünü teslim tarihinden itibaren <strong className="text-white">14 gün</strong> içinde herhangi bir gerekçe göstermeksizin iade edebilirsiniz.</p>
          <p>MotoProf olarak müşteri memnuniyetini esas alarak bu süreyi <strong className="text-white">30 güne</strong> kadar uzatıyoruz.</p>
        </Section>
        <Section title="2. İade Koşulları">
          <p>İade edilecek ürünlerin aşağıdaki koşulları sağlaması gerekmektedir:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-neutral-500">
            <li>Ürün kullanılmamış ve montaj yapılmamış olmalıdır.</li>
            <li>Orijinal ambalajı, aksesuarları ve faturayla birlikte iade edilmelidir.</li>
            <li>Ürün üzerinde herhangi bir hasar, çizik veya kirlilik bulunmamalıdır.</li>
          </ul>
        </Section>
        <Section title="3. İade Edilemeyen Ürünler">
          <ul className="list-disc list-inside space-y-1 text-neutral-500">
            <li>Müşteri talebi doğrultusunda özel olarak sipariş edilen parçalar.</li>
            <li>Ambalajı açılmış conta, yağ filtresi gibi tek kullanımlık parçalar.</li>
            <li>Montaj yapılmış veya araçta denenmiş ürünler.</li>
          </ul>
        </Section>
        <Section title="4. İade Süreci">
          <p>İade talebi oluşturmak için <a href="mailto:iade@motoprof.com.tr" className="text-orange-400 hover:text-orange-300">iade@motoprof.com.tr</a> adresine sipariş numaranızı ve iade gerekçenizi bildirin.</p>
          <p>Onaylanan iadelerde ürün bize ulaştıktan sonra <strong className="text-white">3-5 iş günü</strong> içinde ödemeniz iade edilir.</p>
          <p>İade kargo ücreti, ürün hatası kaynaklı iadelerde MotoProf tarafından, diğer durumlarda müşteri tarafından karşılanır.</p>
        </Section>
        <Section title="5. Değişim">
          <p>Yanlış veya hatalı ürün teslimi durumunda ücretsiz değişim hakkınız bulunmaktadır. Değişim taleplerinde stok durumuna göre işlem yapılır.</p>
        </Section>
      </div>
    </div>
  </div>
);

export default IadePolitikasiPage;
