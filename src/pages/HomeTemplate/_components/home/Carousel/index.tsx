import { useState, useEffect, useCallback } from "react";
import { FaChevronLeft, FaChevronRight, FaArrowRight } from "react-icons/fa";
import { SLIDES } from "./slide";
import type { Slide } from "@/pages/HomeTemplate/_components/home/models/slide"; // Import interface từ folder models
// Import interface từ folder models

// --- SUB-COMPONENTS ---

const SlideBackground = ({
  slide,
  isActive,
}: {
  slide: Slide;
  isActive: boolean;
}) => (
  <div
    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
      isActive ? "opacity-100 z-10" : "opacity-0 z-0"
    }`}
  >
    <img
      src={slide.image}
      alt={slide.title}
      className={`w-full h-full object-cover transform transition-transform duration-6000 ease-linear ${
        isActive ? "scale-110" : "scale-100"
      }`}
    />
    <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/80" />
  </div>
);

const SlideContent = ({ slide }: { slide: Slide }) => (
  // Bây giờ dùng class của Tailwind, không cần thẻ <style> nữa
  <div className="flex flex-col items-center animate-fade-in-up">
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight drop-shadow-2xl uppercase tracking-tight">
      {slide.title} <span className="text-[#B5A65F]">{slide.highlight}</span>
    </h1>
    <p className="text-base md:text-xl mb-10 text-gray-200 leading-relaxed max-w-3xl drop-shadow-md mx-auto font-light">
      {slide.subtitle}
    </p>

    <div className="flex flex-wrap justify-center gap-5 mt-2">
      <a
        href="#"
        className="group/btn relative inline-flex items-center gap-3 px-8 py-3.5 bg-black text-white font-bold text-sm uppercase tracking-wider rounded-full border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
      >
        {/* Dùng class animate-shine-infinite và group-hover:... đã config */}
        <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-25 z-10 animate-shine-infinite group-hover/btn:animate-shine-fast" />
        <span className="relative z-20 flex items-center gap-2">
          {slide.btnPrimary} <FaArrowRight />
        </span>
      </a>

      <a
        href="#"
        className="group/btn relative inline-flex items-center gap-3 px-8 py-3.5 bg-white/10 backdrop-blur-md text-white font-bold text-sm uppercase tracking-wider rounded-full border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:border-white/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
      >
        <span className="relative z-20 flex items-center gap-2">
          {slide.btnSecondary}
        </span>
      </a>
    </div>
  </div>
);

const NavButton = ({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`absolute ${
      direction === "left" ? "left-4 md:left-8" : "right-4 md:right-8"
    } top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm hidden md:flex items-center justify-center hover:scale-110 group`}
  >
    {direction === "left" ? (
      <FaChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
    ) : (
      <FaChevronRight className="text-xl group-hover:translate-x-1 transition-transform" />
    )}
  </button>
);

// --- MAIN COMPONENT ---
export default function CarouselHero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black text-white font-noto group">
      {SLIDES.map((slide, index) => (
        <SlideBackground
          key={slide.id}
          slide={slide}
          isActive={index === currentIndex}
        />
      ))}

      <div className="relative z-20 container mx-auto px-4 text-center max-w-[1000px]">
        <SlideContent
          key={SLIDES[currentIndex].id}
          slide={SLIDES[currentIndex]}
        />
      </div>

      <NavButton direction="left" onClick={prevSlide} />
      <NavButton direction="right" onClick={nextSlide} />

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentIndex
                ? "w-10 bg-[#B5A65F]"
                : "w-2 bg-white/40 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-40 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent z-20 pointer-events-none"></div>
    </section>
  );
}
