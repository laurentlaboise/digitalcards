'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  QrCode,
  Smartphone,
  Wallet,
  Mail,
  Monitor,
  Share2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';
import { CAROUSEL_SLIDES } from '@/data/landing-data';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  QrCode,
  Smartphone,
  Wallet,
  Mail,
  Monitor,
  Share2,
};

const AUTO_PLAY_INTERVAL = 5000;

export default function ShareableCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const slideCount = CAROUSEL_SLIDES.length;

  const scrollToSlide = useCallback(
    (index: number) => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const slideEl = container.children[index] as HTMLElement;
      if (slideEl) {
        container.scrollTo({
          left: slideEl.offsetLeft - container.offsetLeft,
          behavior: 'smooth',
        });
      }
      setCurrentSlide(index);
    },
    []
  );

  const nextSlide = useCallback(() => {
    scrollToSlide((currentSlide + 1) % slideCount);
  }, [currentSlide, slideCount, scrollToSlide]);

  const prevSlide = useCallback(() => {
    scrollToSlide((currentSlide - 1 + slideCount) % slideCount);
  }, [currentSlide, slideCount, scrollToSlide]);

  // Auto-play
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(nextSlide, AUTO_PLAY_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, nextSlide]);

  // Detect scroll position for dot indicator
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      const scrollLeft = container.scrollLeft;
      const slideWidth = (container.children[0] as HTMLElement)?.offsetWidth || 1;
      const gap = 24; // gap-6 = 24px
      const index = Math.round(scrollLeft / (slideWidth + gap));
      setCurrentSlide(Math.min(index, slideCount - 1));
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [slideCount]);

  return (
    <section className="py-section-mobile md:py-section">
      <div className="max-w-container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mb-4">
            The most shareable digital business card
          </h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto">
            Six ways to share. One card. Reach anyone, anywhere — from Zoom calls to trade show floors.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hidden pb-4"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {CAROUSEL_SLIDES.map((slide) => {
              const Icon = ICON_MAP[slide.iconName];
              return (
                <div
                  key={slide.id}
                  className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] md:w-[380px]"
                >
                  <div className="rounded-xl border border-stone-200 bg-white p-6 h-full">
                    <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-5">
                      {Icon && <Icon className="w-6 h-6 text-stone-700" />}
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900 mb-2">
                      {slide.title}
                    </h3>
                    <p className="text-sm text-stone-500 leading-relaxed">
                      {slide.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation arrows (hidden on mobile) */}
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-sm items-center justify-center text-stone-600 hover:text-stone-900 hover:border-stone-300 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-sm items-center justify-center text-stone-600 hover:text-stone-900 hover:border-stone-300 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots + pause */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="flex items-center gap-2">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToSlide(i)}
                className={`rounded-full transition-all ${
                  i === currentSlide
                    ? 'w-2.5 h-2.5 bg-stone-900'
                    : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
            aria-label={isAutoPlaying ? 'Pause auto-play' : 'Resume auto-play'}
          >
            {isAutoPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
