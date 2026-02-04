import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBanners } from '../hooks/useShopData'; // Hook personalizado
import { Skeleton } from './ui/skeleton';

export function HeroCarousel() {
  const { data: banners = [], isLoading } = useBanners();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl mx-4 mt-4" />;
  }

  if (banners.length === 0) {
    return null; // O mostrar un placeholder
  }

  return (
    <section className="relative overflow-hidden rounded-2xl mx-4 mt-4">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((slide) => (
          <div
            key={slide.id}
            className={`min-w-full relative h-48 sm:h-64 md:h-80 bg-gradient-to-r ${slide.bgColor || 'from-amber-400 to-orange-500'} rounded-2xl overflow-hidden`}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="flex-1 p-6 sm:p-8 z-10">
                {slide.discount && (
                  <span className="inline-block bg-card/90 backdrop-blur text-primary text-xs sm:text-sm font-bold px-3 py-1 rounded-full mb-2 sm:mb-3">
                    {slide.discount}
                  </span>
                )}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-1 sm:mb-2">
                  {slide.title}
                </h2>
                <p className="text-primary-foreground/80 text-sm sm:text-base">
                  {slide.subtitle}
                </p>
              </div>
              <div className="hidden sm:block w-1/2 h-full relative">
                <img
                  src={slide.image ? `http://localhost:3000${slide.image}` : '/placeholder.png'}
                  alt={slide.title}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 object-cover rounded-full shadow-2xl opacity-90"
                />
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-card/80 backdrop-blur rounded-full shadow-lg hover:bg-card transition-colors z-20"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5 text-foreground" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-card/80 backdrop-blur rounded-full shadow-lg hover:bg-card transition-colors z-20"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5 text-foreground" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                ? 'bg-primary-foreground w-6'
                : 'bg-primary-foreground/40'
              }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
