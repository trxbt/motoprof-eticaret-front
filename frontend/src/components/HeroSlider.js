import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1572283046480-e990be92d301?w=1600&q=85',
    badge: 'Premium Kalite',
    title: 'Orijinal',
    titleAccent: 'Yedek Parça',
    description: 'Honda, Yamaha, CFMoto ve Bajaj için 25+ orijinal kalite ürün',
    cta: 'Hemen Keşfet',
    ctaLink: '/urunler',
  },
  {
    image: 'https://images.unsplash.com/photo-1687265769434-6930a0dc08ef?w=1600&q=85',
    badge: 'Aynı Gün Teslimat',
    title: 'Hızlı',
    titleAccent: 'Kargo Garantisi',
    description: 'Saat 14:00\'a kadar verilen siparişler aynı gün kargoda',
    cta: 'Siparişe Başla',
    ctaLink: '/urunler',
  },
  {
    image: 'https://images.unsplash.com/photo-1572283046480-e990be92d301?w=1600&q=85',
    badge: 'Uzman Kadro',
    title: 'Teknik',
    titleAccent: 'Destek Hattı',
    description: 'Uyumlu parça bulmak için uzman teknik ekibimize ulaşın',
    cta: 'Bize Ulaşın',
    ctaLink: '/urunler',
  },
];

const STATS = [
  { value: '25+', label: 'Ürün Çeşidi' },
  { value: '4', label: 'Marka' },
  { value: '14', label: 'Model' },
  { value: '100%', label: 'Orijinal Kalite' },
];

const HeroSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [current, setCurrent] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setCurrent(emblaApi.selectedScrollSnap()));
    const interval = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="relative overflow-hidden bg-[#0a0a0a]" style={{ height: 'calc(100vh - 64px)', minHeight: 520, maxHeight: 780 }}>
      {/* Embla */}
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container h-full">
          {SLIDES.map((slide, i) => (
            <div key={i} className="embla__slide relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
              {/* Cinematic overlay */}
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to right, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.7) 50%, rgba(10,10,10,0.4) 100%)'
              }} />
              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-40"
                style={{ background: 'linear-gradient(to top, #0a0a0a, transparent)' }} />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
                  <div className="max-w-xl">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 mb-5 animate-fade-in">
                      <span className="flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full tracking-wider">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                        {slide.badge}
                      </span>
                    </div>

                    {/* Heading */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-chivo leading-none tracking-tight animate-fade-in-up animate-delay-100">
                      <span className="text-white block">{slide.title}</span>
                      <span className="text-gradient-orange block">{slide.titleAccent}</span>
                    </h1>

                    <p className="text-base sm:text-lg text-neutral-400 mt-5 mb-8 leading-relaxed animate-fade-in-up animate-delay-200">
                      {slide.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-4 animate-fade-in-up animate-delay-300">
                      <Link
                        to={slide.ctaLink}
                        data-testid={`hero-cta-${i}`}
                        className="group inline-flex items-center gap-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm uppercase tracking-widest glow-orange-sm active:scale-95"
                      >
                        {slide.cta}
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav arrows */}
      <button onClick={scrollPrev} data-testid="hero-prev-btn"
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/8 hover:bg-orange-500 border border-white/15 hover:border-orange-500 text-white rounded-xl transition-all duration-200 backdrop-blur-sm hidden sm:flex">
        <ChevronLeft size={18} />
      </button>
      <button onClick={scrollNext} data-testid="hero-next-btn"
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/8 hover:bg-orange-500 border border-white/15 hover:border-orange-500 text-white rounded-xl transition-all duration-200 backdrop-blur-sm hidden sm:flex">
        <ChevronRight size={18} />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-8 right-6 sm:right-10 lg:right-16 flex flex-col gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => emblaApi && emblaApi.scrollTo(i)} data-testid={`hero-dot-${i}`}
            className={`w-1 rounded-full transition-all duration-300 ${i === current ? 'bg-orange-500 h-8' : 'bg-white/30 h-3 hover:bg-white/60'}`} />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
