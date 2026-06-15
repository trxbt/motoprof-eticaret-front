import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Sipariş verdikten sonra ne zaman kargoya verilir?',
    a: 'Stoklu ürünlerde siparişiniz mesai saatleri içinde verilirse aynı gün, aksi takdirde ertesi iş günü kargoya teslim edilir.'
  },
  {
    q: 'Hangi kargo firmalarıyla çalışıyorsunuz?',
    a: 'Yurtiçi Kargo ve Aras Kargo ile çalışmaktayız. Sipariş tutarınıza göre ücretsiz kargo imkânı sunulabilmektedir.'
  },
  {
    q: 'Ürünlerim orijinal mi?',
    a: 'Sitemizde satılan tüm ürünler ya orjinal (OEM) ya da yetkili distribütörler tarafından sağlanan yüksek kaliteli muadil parçalardır. Her ürün sayfasında parça türü belirtilmektedir.'
  },
  {
    q: 'Yanlış parça sipariş ettim, iade edebilir miyim?',
    a: 'Evet. Ürünü teslim aldığınız tarihten itibaren 30 gün içinde, kullanılmamış ve orijinal ambalajında olmak koşuluyla iade edebilirsiniz. İade süreci için müşteri hizmetlerimizle iletişime geçin.'
  },
  {
    q: 'Aradığım parçayı sitede bulamıyorum, ne yapmalıyım?',
    a: 'Teknik destek ekibimize model bilginizi ve ihtiyacınız olan parçanın adını ileterek talep oluşturabilirsiniz. Ekibimiz size en kısa sürede geri dönüş yapacaktır.'
  },
  {
    q: 'Faturamı nasıl alabilirim?',
    a: 'Siparişlerinize ait e-fatura, teslimat sonrasında kayıtlı e-posta adresinize otomatik olarak iletilmektedir. Ayrıca hesabım sayfanızdan da indirebilirsiniz.'
  },
  {
    q: 'Kapıda ödeme seçeneğiniz var mı?',
    a: 'Şu an için kapıda ödeme seçeneğimiz bulunmamaktadır. Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz.'
  },
  {
    q: 'Taksit imkânı var mı?',
    a: 'Anlaşmalı bankalarımızın kredi kartlarıyla 3 ila 12 taksit imkânından yararlanabilirsiniz. Taksit seçenekleri ödeme adımında görüntülenir.'
  },
];

const SSSPage = () => {
  const [open, setOpen] = useState(null);
  return (
    <div className="min-h-screen bg-[#060606] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[10px] text-neutral-600 mb-10 uppercase tracking-widest">
          <Link to="/" className="hover:text-orange-400 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-neutral-400">SSS</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Sıkça Sorulan Sorular</h1>
        <div className="w-12 h-0.5 bg-orange-500 mb-10" />
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left group"
              >
                <span className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors pr-4">{faq.q}</span>
                <ChevronDown size={16} className={`text-neutral-500 flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180 text-orange-400' : ''}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <div className="w-full h-px bg-white/5 mb-4" />
                  <p className="text-sm text-neutral-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 bg-orange-500/5 border border-orange-500/10 rounded-2xl p-6 text-center">
          <p className="text-neutral-400 text-sm mb-3">Aradığınız cevabı bulamadınız mı?</p>
          <a href="mailto:info@motoprof.com.tr" className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-xl transition-colors">
            Bize Yazın
          </a>
        </div>
      </div>
    </div>
  );
};

export default SSSPage;
