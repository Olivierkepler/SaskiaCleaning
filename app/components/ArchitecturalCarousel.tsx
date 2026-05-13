import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    url: "/images/saskia1.JPG",
    title: "Clean Interior Living Space"
  },
  
  {
    url: "/images/cleaning1.jpg",
    title: "Luxury Glass Facade Design"
  },
  {
    url: "/images/cleaing2.jpg",
    title: "Clean Interior Living Space"
  }, 
  // {
  //   url: "/images/cleaing.jpg",
  //   title: "Modern Minimal Architecture"
  // },


  
];

export default function ArchitecturalCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoPlayInterval = 5000; // 5 seconds

  // Memoized nextSlide function to use in both manual click and auto-play
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  // Auto-play Logic
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    // Cleanup: This clears the interval when the component unmounts 
    // OR when the currentIndex changes (resetting the timer on manual click)
    return () => clearInterval(timer);
  }, [currentIndex, nextSlide]);

  return (
    <div className="relative w-full h-[600px] group overflow-hidden bg-black">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div className="relative w-full h-full overflow-hidden">
            <img 
              src={slide.url} 
              alt={slide.title}
              className={`w-full h-full object-cover transition-transform duration-[2.5s] ease-out ${
                index === currentIndex ? "scale-100" : "scale-110"
              }`}
            />
            <div className="absolute bottom-10 left-10 text-white z-20">
              <h2 className="text-2xl font-light tracking-widest uppercase bg-black/40 p-4 backdrop-blur-sm border-l-4 border-white">
                {slide.title}
              </h2>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 left-5 items-center justify-center rounded-full p-2 bg-black/30 text-white hover:bg-black/60 transition-all z-30"
      >
        <ChevronLeft size={30} />
      </button>
      <button 
        onClick={nextSlide}
        className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 right-5 items-center justify-center rounded-full p-2 bg-black/30 text-white hover:bg-black/60 transition-all z-30"
      >
        <ChevronRight size={30} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, index) => (
          <button 
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-500 h-1 rounded-full ${
              currentIndex === index ? "w-8 bg-white" : "w-2 bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
