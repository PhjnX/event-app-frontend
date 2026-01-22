import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { SLIDES, type Slide } from "./slide";

import LoginModal from "../../modals/LoginModal";
import OrganizerRegModal from "../../common/OrganizerRegModal";

const Device3D = ({ slide }: { slide: Slide }) => {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [0, 1], ["25deg", "-25deg"]);
  const rotateY = useTransform(mouseXSpring, [0, 1], ["-25deg", "25deg"]);
  const shadowX = useTransform(mouseXSpring, [0, 1], [20, -20]);
  const shadowY = useTransform(mouseYSpring, [0, 1], [20, -20]);
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };
  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };
  const deviceWidth = {
    phone: "w-[200px] sm:w-[240px] md:w-[300px]",
    tablet: "w-[280px] sm:w-[360px] md:w-[450px]",
    laptop: "w-[340px] sm:w-[500px] md:w-[700px]",
  }[slide.deviceType];
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.9 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative z-30 flex items-center justify-center w-full h-full"
      style={{ perspective: 1500 }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`relative ${deviceWidth} cursor-grab active:cursor-grabbing py-10`}
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.img
            src={slide.device}
            alt={slide.title}
            style={{ translateZ: 100 }}
            className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] select-none z-10"
          />
          <motion.div
            style={{ translateZ: -50, x: shadowX, y: shadowY }}
            className="absolute inset-10 bg-[rgba(0,0,0,0.4)] blur-2xl` rounded-full -z-10"
          />
          <div className="absolute inset-0 pointer-events-none rounded-[3rem] bg-linear-to-tr from-[rgba(255,255,255,0.1)] to-transparent opacity-30 z-20" />
        </motion.div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[rgba(181,166,95,0.2)] blur-[120px] -z-20 rounded-full scale-110" />
      </motion.div>
    </motion.div>
  );
};

const SlideBackground = ({
  slide,
  isActive,
}: {
  slide: Slide;
  isActive: boolean;
}) => (
  <div
    className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`}
  >
    <img
      src={slide.image}
      alt={slide.title}
      className={`w-full h-full object-cover transform transition-transform duration-10000 ${isActive ? "scale-110" : "scale-100"}`}
    />
    <div className="absolute inset-0 bg-linear-to-r from-black via-black/60 to-transparent" />
    <div className="lg:hidden absolute inset-0 bg-black/40" />
  </div>
);

export default function CarouselHero() {
  const { t } = useTranslation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const currentSlide = SLIDES[currentIndex];

  const renderButton = (
    label: string,
    path: string,
    variant: "primary" | "secondary",
  ) => {
    const primaryClass =
      "font-noto group relative inline-flex items-center gap-2 px-7 py-3 bg-[#B5A65F] text-black font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(181,166,95,0.4)]";
    const secondaryClass =
      "font-noto px-7 py-3 bg-[rgba(255,255,255,0.05)] backdrop-blur-md text-white font-bold text-xs uppercase tracking-widest rounded-full border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[#B5A65F] transition-all duration-300 hover:-translate-y-1";

    const className = variant === "primary" ? primaryClass : secondaryClass;
    const content = (
      <>
        {label}{" "}
        {variant === "primary" && (
          <FaArrowRight
            size={12}
            className={variant === "primary" ? "relative z-10" : ""}
          />
        )}
      </>
    );

    if (path === "#login") {
      return (
        <button onClick={() => setLoginModalOpen(true)} className={className}>
          {variant === "primary" ? (
            <span className="relative z-10 flex items-center gap-2">
              {content}
            </span>
          ) : (
            content
          )}
        </button>
      );
    }

    if (path === "#contact") {
      return (
        <button onClick={() => setIsOrgModalOpen(true)} className={className}>
          {variant === "primary" ? (
            <span className="relative z-10 flex items-center gap-2">
              {content}
            </span>
          ) : (
            content
          )}
        </button>
      );
    }

    return (
      <Link to={path} className={className}>
        {variant === "primary" ? (
          <span className="relative z-10 flex items-center gap-2">
            {content}
          </span>
        ) : (
          content
        )}
      </Link>
    );
  };

  return (
    <section className="relative min-h-dvh w-full overflow-hidden bg-[#050505] text-white font-noto selection:bg-[rgba(181,166,95,0.3)] selection:text-black">
      {SLIDES.map((slide, index) => (
        <SlideBackground
          key={slide.id}
          slide={slide}
          isActive={index === currentIndex}
        />
      ))}

      <div className="relative z-20 container mx-auto px-6 lg:px-12 h-full flex flex-col justify-center min-h-dvh pt-24 lg:pt-0 pb-12">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
          <motion.div
            key={`text-${currentSlide.id}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left order-1 mt-4 lg:mt-0"
          >
            <h1 className="font-noto text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold mb-5 leading-[1.2] uppercase tracking-tighter drop-shadow-2xl text-white">
              {t(currentSlide.title as any)} <br />
              <span className="text-[#B5A65F]">
                {t(currentSlide.highlight as any)}
              </span>
            </h1>

            <p className="text-sm md:text-base mb-8 text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light drop-shadow-md font-noto">
              {t(currentSlide.subtitle as any)}
            </p>

            <div className="flex flex-wrap gap-4 font-noto justify-center lg:justify-start">
              {renderButton(
                t(currentSlide.btnPrimary as any),
                currentSlide.pathPrimary,
                "primary",
              )}
              {renderButton(
                t(currentSlide.btnSecondary as any),
                currentSlide.pathSecondary,
                "secondary",
              )}
            </div>
          </motion.div>

          <div className="flex items-center justify-center w-full h-full order-2 lg:order-2">
            <div className="w-full min-h-[350px] lg:h-auto mt-8 mb-16 lg:my-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <Device3D key={currentSlide.id} slide={currentSlide} />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-[#050505] to-transparent z-20 pointer-events-none" />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={() => setLoginModalOpen(false)}
        onSwitchToForgot={() => setLoginModalOpen(false)}
      />
      <OrganizerRegModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
      />
    </section>
  );
}
