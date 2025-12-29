import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaArrowRight } from "react-icons/fa";
import type { Slide } from "../models/slide";
import { SLIDES } from "./slide";
import LoginModal from "../../modals/LoginModal";

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
    <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-black/80" />
  </div>
);

interface SlideContentProps {
  slide: Slide;
  onOpenLogin: () => void;
}

const SlideContent = ({ slide, onOpenLogin }: SlideContentProps) => {
  const secondaryBtnClass =
    "group/btn relative inline-flex items-center gap-3 px-8 py-3.5 bg-white/5 backdrop-blur-md text-white font-bold text-sm uppercase tracking-wider rounded-full border border-white/20 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:border-[#B5A65F] hover:text-[#B5A65F] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer";

  const innerBtnContent = (
    <>
      <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 z-10 animate-shine-infinite" />
      <span className="relative z-20 flex items-center gap-2">
        {slide.btnSecondary}
      </span>
    </>
  );

  return (
    <div className="flex flex-col items-center animate-fade-in-up px-4 relative z-20">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight drop-shadow-2xl uppercase tracking-tight text-center text-white">
        {slide.title} <span className="text-[#B5A65F]">{slide.highlight}</span>
      </h1>

      <p className="text-base md:text-lg mb-10 text-gray-300 leading-relaxed max-w-3xl drop-shadow-md mx-auto font-light text-center">
        {slide.subtitle}
      </p>

      <div className="flex flex-wrap justify-center gap-5 mt-2">
        <Link
          to={slide.pathPrimary}
          className="group/btn relative inline-flex items-center gap-3 px-8 py-3.5 bg-[#B5A65F] text-black font-bold text-sm uppercase tracking-wider rounded-full border border-[#B5A65F] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(181,166,95,0.5)]"
        >
          <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/40 to-transparent -skew-x-12 z-10 animate-shine-infinite group-hover/btn:animate-shine-fast" />
          <span className="relative z-20 flex items-center gap-2">
            {slide.btnPrimary} <FaArrowRight />
          </span>
        </Link>

        {slide.pathSecondary === "#login" ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onOpenLogin();
            }}
            className={secondaryBtnClass}
          >
            {innerBtnContent}
          </button>
        ) : (
          <Link to={slide.pathSecondary} className={secondaryBtnClass}>
            {innerBtnContent}
          </Link>
        )}
      </div>
    </div>
  );
};

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
    } top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-[#B5A65F] hover:bg-black/60 hover:border-[#B5A65F] transition-all backdrop-blur-sm hidden md:flex items-center justify-center hover:scale-110 group shadow-lg`}
  >
    {direction === "left" ? (
      <FaChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
    ) : (
      <FaChevronRight className="text-xl group-hover:translate-x-1 transition-transform" />
    )}
  </button>
);


export default function CarouselHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleSwitchToRegister = () => {
    console.log("Người dùng muốn chuyển sang trang Đăng ký");
    setLoginModalOpen(false);
  };

  const handleSwitchToForgot = () => {
    console.log("Người dùng quên mật khẩu");
    setLoginModalOpen(false);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#050505] text-white font-noto group">
      {SLIDES.map((slide, index) => (
        <SlideBackground
          key={slide.id}
          slide={slide}
          isActive={index === currentIndex}
        />
      ))}

      <div className="relative z-20 container mx-auto px-4 text-center max-w-[1200px]">
        <SlideContent
          key={SLIDES[currentIndex].id}
          slide={SLIDES[currentIndex]}
          onOpenLogin={() => setLoginModalOpen(true)}
        />
      </div>

      <NavButton direction="left" onClick={prevSlide} />
      <NavButton direction="right" onClick={nextSlide} />

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-500 shadow-md ${
              index === currentIndex
                ? "w-12 bg-[#B5A65F]"
                : "w-2 bg-white/30 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-[#050505] via-[#050505]/70 to-transparent z-20 pointer-events-none"></div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
        onSwitchToForgot={handleSwitchToForgot}
      />
    </section>
  );
}
