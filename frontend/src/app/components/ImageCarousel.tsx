'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from "next/image";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useQuery } from '@tanstack/react-query';
import { productAPI } from '@/services/api';
import Link from 'next/link';

const AUTO_SCROLL_INTERVAL = 4000;
const RESUME_DELAY = 6000;

const ImageCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Fetch trending products for the carousel
  const { data: trendingData, isLoading } = useQuery({
    queryKey: ['carousel-trending'],
    queryFn: async () => {
      const res = await productAPI.getTrending({ limit: 5 });
      return res.data;
    },
  });

  const products = trendingData?.items || [];

  // Map products to slides
  const slides = products.map((product: any) => ({
    id: product._id,
    src: product.coverImage || '/placeholder.png',
    alt: product.title,
    slug: product.slug || product._id,
    title: product.title,
  }));

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const startAutoScroll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length <= 1) return; // Don't auto-scroll if 0 or 1 slide

    timerRef.current = setInterval(() => {
      nextSlide();
    }, AUTO_SCROLL_INTERVAL);
  }, [nextSlide, slides.length]);

  const stopAutoScroll = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pauseAndResume = useCallback(() => {
    stopAutoScroll();
    setIsPaused(true);

    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);

    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
      startAutoScroll();
    }, RESUME_DELAY);
  }, [startAutoScroll, stopAutoScroll]);

  // Initial auto-scroll setup
  useEffect(() => {
    if (slides.length > 1) {
      startAutoScroll();
    }
    return () => {
      stopAutoScroll();
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [startAutoScroll, stopAutoScroll, slides.length]);

  // Handle manual navigation
  const handleManualNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pauseAndResume();
    nextSlide();
  };

  const handleManualPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pauseAndResume();
    prevSlide();
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pauseAndResume();
    setCurrent(index);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    stopAutoScroll(); // Pause immediately on touch
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) {
      // If just a tap without move, resume after delay
      pauseAndResume();
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;

    // Resume auto-scroll
    pauseAndResume();
  };

  // Mouse handlers for desktop pause behavior
  const handleMouseEnter = () => stopAutoScroll();
  const handleMouseLeave = () => {
    if (!isPaused) startAutoScroll();
  };

  if (isLoading) {
    return <div className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] bg-gray-100 animate-pulse rounded-xl" />;
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full h-[80vh] sm:h-[60vh] md:h-[70vh] overflow-hidden  group"
      role="region"
      aria-roledescription="carousel"
      aria-label="Trending Products"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slides */}
      {slides.map((slide: any, index: number) => (
        <Link
          href={`/products/${slide.slug}`}
          key={slide.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${index + 1} of ${slides.length}: ${slide.title}`}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          onClick={(e) => {
            // Allow navigation unless it was a swipe
            if (touchStartX.current && touchEndX.current && Math.abs(touchStartX.current - touchEndX.current) > 10) {
              e.preventDefault();
            }
          }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          />

          {/* Optional: Title Overlay */}
          <div className="absolute bottom-12 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
            <h3 className="text-lg font-bold uppercase tracking-widest drop-shadow-md text-center">
              {slide.title}
            </h3>
          </div>
        </Link>
      ))}

      {/* Overlay gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 z-20" />

      {/* Navigation Buttons - Hidden on mobile, visible on hover/desktop */}
      {slides.length > 1 && (
        <div className="hidden sm:flex absolute justify-between items-center w-full px-4 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleManualPrev}
            className="btn btn-circle btn-outline bg-base-100/70 border-base-300 hover:bg-accent hover:text-white"
            aria-label="Previous slide"
          >
            <IoChevronBackOutline size={18} />
          </button>
          <button
            onClick={handleManualNext}
            className="btn btn-circle btn-outline bg-base-100/70 border-base-300 hover:bg-accent hover:text-white"
            aria-label="Next slide"
          >
            <IoChevronForwardOutline size={18} />
          </button>
        </div>
      )}

      {/* Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_: any, i: number) => (
            <button
              key={i}
              onClick={(e) => handleDotClick(i, e)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? "true" : "false"}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${i === current ? "bg-accent scale-110" : "bg-base-300/80 hover:bg-base-100"
                }`}
            />
          ))}
        </div>
      )}

      <div className="sr-only" aria-live="polite">
        Showing slide {current + 1} of {slides.length}
      </div>
    </div>
  );
}

export default ImageCarousel;