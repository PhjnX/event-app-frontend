import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { SAMPLE_NEWS } from "./news-data"; // Import Data
import type { News } from "@/pages/HomeTemplate/_components/home/models/news"; // Import Model
// Import Model

// --- COMPONENT CON 1: HÌNH NỀN TRANG TRÍ ---
const BackgroundDecoration = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[#0a0a0a]"></div>
    <div className="absolute inset-0 opacity-15">
      <svg width="100%" height="100%">
        <pattern
          id="hexagons"
          width="50"
          height="43.4"
          patternUnits="userSpaceOnUse"
          patternTransform="scale(2)"
        >
          <path
            d="M25 0 L50 12.5 L50 37.5 L25 50 L0 37.5 L0 12.5 Z"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[500px] bg-[#B5A65F]/10 rounded-[100%] blur-[120px]"></div>
    <motion.div
      initial={{ height: 0 }}
      whileInView={{ height: "100%" }}
      transition={{ duration: 1.5 }}
      className="absolute top-0 left-10 w-px bg-linear-to-b from-transparent via-white/10 to-transparent"
    ></motion.div>
    <motion.div
      initial={{ height: 0 }}
      whileInView={{ height: "100%" }}
      transition={{ duration: 1.5 }}
      className="absolute top-0 right-10 w-px bg-linear-to-b from-transparent via-white/10 to-transparent"
    ></motion.div>
  </div>
);

// --- COMPONENT CON 2: CARD TIN TỨC ---
interface NewsCardProps {
  news: News;
  position: "left" | "center" | "right";
  onDragStart: () => void;
  onDragEnd: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => void;
}

const NewsCard = ({
  news,
  position,
  onDragStart,
  onDragEnd,
}: NewsCardProps) => {
  const isCenter = position === "center";
  const isLeft = position === "left";

  return (
    <motion.div
      // Logic Kéo thả
      drag={isCenter ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      // Logic Animation
      initial={{
        x: isCenter ? 0 : isLeft ? -200 : 200,
        scale: 0.8,
        opacity: 0,
      }}
      animate={{
        x: isCenter ? "0%" : isLeft ? "-85%" : "85%",
        scale: isCenter ? 1.1 : 0.85,
        zIndex: isCenter ? 20 : 10,
        opacity: isCenter ? 1 : 0.3,
        filter: isCenter
          ? "brightness(1) blur(0px)"
          : "brightness(0.4) blur(4px)",
        cursor: isCenter ? "grab" : "default",
      }}
      whileTap={{ cursor: "grabbing" }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute w-[90%] md:w-[800px] h-[350px] md:h-[450px] rounded-3xl"
    >
      <div
        className={`relative w-full h-full rounded-3xl overflow-hidden border shadow-2xl group transition-all duration-500
            ${
              isCenter
                ? "border-[#B5A65F]/50 shadow-[0_0_50px_rgba(181,166,95,0.15)]"
                : "border-white/5"
            }
        `}
      >
        <img
          src={news.image}
          alt={news.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 pointer-events-none"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent opacity-90 pointer-events-none"></div>

        <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end pointer-events-none">
          <div className="transform transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="bg-[#B5A65F] text-black text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                {news.category}
              </span>
              <div className="flex items-center gap-4 text-xs text-gray-300 uppercase tracking-wider font-bold">
                <span className="flex items-center gap-2">
                  <FaCalendarAlt className="text-[#B5A65F]" /> {news.date}
                </span>
                <span className="flex items-center gap-2">
                  <FaUser className="text-[#B5A65F]" /> {news.author}
                </span>
              </div>
            </div>

            <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight font-noto group-hover:text-[#B5A65F] transition-colors pointer-events-auto">
              <Link to={`/news/${news.id}`}>{news.title}</Link>
            </h3>

            <motion.div
              animate={{ opacity: isCenter ? 1 : 0 }}
              className="overflow-hidden pointer-events-auto"
            >
              <p className="text-gray-300 text-base md:text-lg line-clamp-2 mb-6 max-w-2xl font-light">
                {news.excerpt}
              </p>
              <Link
                to={`/news/${news.id}`}
                className="inline-flex items-center gap-3 text-[#B5A65F] text-sm font-bold uppercase tracking-widest hover:text-white transition-colors border-b border-[#B5A65F] pb-1 hover:border-white"
              >
                Xem chi tiết <FaArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- COMPONENT CHÍNH ---
const NewsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SAMPLE_NEWS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % SAMPLE_NEWS.length);
  };

  const handlePrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + SAMPLE_NEWS.length) % SAMPLE_NEWS.length
    );
  };

  const onDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      handlePrev();
    } else if (info.offset.x < -threshold) {
      handleNext();
    }
    setIsPaused(false);
  };

  const getVisibleItems = () => {
    const len = SAMPLE_NEWS.length;
    const prevIndex = (activeIndex - 1 + len) % len;
    const nextIndex = (activeIndex + 1) % len;
    return [
      { ...SAMPLE_NEWS[prevIndex], position: "left" as const },
      { ...SAMPLE_NEWS[activeIndex], position: "center" as const },
      { ...SAMPLE_NEWS[nextIndex], position: "right" as const },
    ];
  };

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden text-white font-noto">
      <BackgroundDecoration />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-wide mb-6 font-noto drop-shadow-xl">
            TIN TỨC <span className="text-[#B5A65F]">MỚI NHẤT</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl font-noto max-w-2xl mx-auto leading-relaxed italic">
            "Cập nhật những thông tin công nghệ, xu hướng giáo dục và hoạt động
            nổi bật tại Webie Vietnam."
          </p>
        </motion.div>

        {/* Carousel Area */}
        <div className="relative h-[550px] flex items-center justify-center group/carousel">
          <button
            onClick={handlePrev}
            className="absolute left-0 md:left-10 z-30 p-4 rounded-full bg-black/50 border border-white/10 text-white hover:bg-[#B5A65F] hover:text-black transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:block"
          >
            <FaChevronLeft size={24} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 md:right-10 z-30 p-4 rounded-full bg-black/50 border border-white/10 text-white hover:bg-[#B5A65F] hover:text-black transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:block"
          >
            <FaChevronRight size={24} />
          </button>

          <AnimatePresence mode="popLayout">
            {getVisibleItems().map((news) => (
              <NewsCard
                key={news.id}
                news={news}
                position={news.position}
                onDragStart={() => setIsPaused(true)}
                onDragEnd={onDragEnd}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
