import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1572283046480-e990be92d301?w=1400&q=80',
    title: 'Orijinal Kalitede',
    subtitle: 'Motosiklet Yedek Parça',
    description: 'Honda, Yamaha, CFMoto ve Bajaj için yüzlerce ürün',
    cta: 'Hemen Keşfet',
    ctaLink: '/urunler',
  },
  {
    image: 'https://images.unsplash.com/photo-1687265769434-6930a0dc08ef?w=1400&q=80',
    title: 'Hızlı Kargo',
    subtitle: 'Aynı Gün Sipariş',
    description: 'Saat 14:00\'a kadar verilen siparişler aynı gün kargoda',
    cta: 'Siparişe Başla',
    ctaLink: '/urunler',
  },
  {
    image: 'https://images.unsplash.com/photo-1572283046480-e990be92d301?w=1400&q=80',
    title: 'Uzman Destek',
    subtitle: 'Teknik Yardım',
    description: 'Uyumlu parça bulmak için teknik ekibimizle iletişime geçin',
    cta: 'Bize Ulaşın',
    ctaLink: '/urunler',
  },
];

const HeroSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [current, setCurrent] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setCurrent(emblaApi.selectedScrollSnap()));
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="relative h-[75vh] min-h-[480px] max-h-[700px] overflow-hidden bg-[#0a0a0a]">
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
              <div className="absolute inset-0 hero-overlay" />
              {/* Slide content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4 max-w-2xl">
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-orange-400 mb-3">
                    {slide.subtitle}
                  </p>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-chivo leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-base sm:text-lg text-neutral-300 mt-4 mb-8">
                    {slide.description}
                  </p>
                  <a
                    href={slide.ctaLink}
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-lg transition-all duration-200 text-sm uppercase tracking-wider active:scale-95"
                    data-testid={`hero-cta-${i}`}
                  >
                    {slide.cta}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-orange-500 text-white rounded-full transition-all duration-200 backdrop-blur-sm hidden sm:flex"
        data-testid="hero-prev-btn"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-orange-500 text-white rounded-full transition-all duration-200 backdrop-blur-sm hidden sm:flex"
        data-testid="hero-next-btn"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi && emblaApi.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-orange-500 w-6' : 'bg-white/40 w-1.5'}`}
            data-testid={`hero-dot-${i}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
