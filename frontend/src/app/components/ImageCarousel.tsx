'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import Img1 from '../../../public/1.png';
import Img2 from '../../../public/2.png';
import Img3 from '../../../public/3.png';


const slides = [
    { id: 1, src: "/1.png", alt: "Slide 1" },
    { id: 2, src: "/2.png", alt: "Slide 2" },
    { id: 3, src: "/3.png", alt: "Slide 3" },
    // { id: 4, src: "/4.jpg", alt: "Slide 4" },
  ];

const ImageCarousel = () => {
  const [current, setCurrent] = useState(0);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] overflow-hidden rounded-xl">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            className="object-cover"
          />
        </div>
      ))}

      {/* Overlay gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />

      {/* Navigation Buttons */}
      <div className="absolute flex justify-between items-center w-full px-4 top-1/2 -translate-y-1/2">
        <button onClick={prevSlide} className="btn btn-circle btn-outline bg-base-100/70 border-base-300 hover:bg-accent hover:text-white">
          <IoChevronBackOutline size={18} />
        </button>
        <button onClick={nextSlide} className="btn btn-circle btn-outline bg-base-100/70 border-base-300 hover:bg-accent hover:text-white">
          <IoChevronForwardOutline size={18} />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
              i === current ? "bg-accent" : "bg-base-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default ImageCarousel;