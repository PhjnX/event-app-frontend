import { useState, useEffect, useMemo, memo } from "react";
import {
  motion,
  AnimatePresence,
  type Variants,
  type PanInfo,
} from "framer-motion";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "@/store";
import { fetchPublicPosts } from "@/store/slices/newsSlice";
import { useTranslation } from "react-i18next";

interface NewsUI {
  id: number | string;
  title: string;
  image: string;
  category: string;
  date: string;
  author: string;
  excerpt: string;
}

const BackgroundDecoration = () => (
  <div
    className="absolute inset-0 z-0 pointer-events-none"
    style={{
      backgroundColor: "#0a0a0a",
      backgroundImage:
        "radial-gradient(rgba(255, 255, 255, 0.15) 1px, rgba(0, 0, 0, 0) 1px)",
      backgroundSize: "30px 30px",
      maskImage:
        "linear-gradient(to bottom, rgba(0,0,0,0), black 15%, black 85%, rgba(0,0,0,0))",
      WebkitMaskImage:
        "linear-gradient(to bottom, rgba(0,0,0,0), black 15%, black 85%, rgba(0,0,0,0))",
    }}
  ></div>
);

const scrollVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

interface NewsCardProps {
  news: NewsUI;
  position: "left" | "center" | "right";
  onDragStart: () => void;
  onDragEnd: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => void;
}

const NewsCard = memo(
  ({ news, position, onDragStart, onDragEnd }: NewsCardProps) => {
    const { t } = useTranslation();
    const isCenter = position === "center";
    const isLeft = position === "left";

    return (
      <motion.div
        drag={isCenter ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
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
                ? "border-[#D8C97B]/50 shadow-[0_0_50px_rgba(216,201,123,0.1)]"
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
                <span className="bg-[#D8C97B] text-black text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                  {news.category ||
                    t("home.news_section.card.category_default")}
                </span>
                <div className="flex items-center gap-4 text-xs text-gray-300 uppercase tracking-wider font-bold">
                  <span className="flex items-center gap-2">
                    <FaCalendarAlt className="text-[#D8C97B]" /> {news.date}
                  </span>
                </div>
              </div>

              <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight font-noto group-hover:text-[#D8C97B] transition-colors pointer-events-auto line-clamp-2">
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
                  className="inline-flex items-center gap-3 text-[#D8C97B] text-sm font-bold uppercase tracking-widest hover:text-white transition-colors border-b border-[#D8C97B] pb-1 hover:border-white"
                >
                  {t("home.news_section.card.details")} <FaArrowRight />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
);

NewsCard.displayName = "NewsCard";

const NewsSection = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { data: apiData, loading } = useSelector(
    (state: RootState) => state.news,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    dispatch(fetchPublicPosts({ page: 0, size: 10 }));
  }, [dispatch]);

  const newsList: NewsUI[] = useMemo(() => {
    if (!apiData || apiData.length === 0) return [];

    const mapped = apiData.map((item: any) => ({
      id: item.id || item.slug,
      title: item.title,
      image: item.thumbnailUrl,
      category: "",
      date: new Date(item.createdAt).toLocaleDateString("vi-VN"),
      author: "",
      excerpt: item.summary,
    }));

    if (mapped.length > 0 && mapped.length < 3) {
      return [...mapped, ...mapped, ...mapped].slice(0, 3);
    }

    return mapped;
  }, [apiData]);

  useEffect(() => {
    if (isPaused || newsList.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % newsList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, newsList.length]);

  const handleNext = () => {
    if (newsList.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % newsList.length);
  };

  const handlePrev = () => {
    if (newsList.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + newsList.length) % newsList.length);
  };

  const onDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
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
    if (newsList.length === 0) return [];
    const len = newsList.length;
    const prevIndex = (activeIndex - 1 + len) % len;
    const nextIndex = (activeIndex + 1) % len;
    return [
      { ...newsList[prevIndex], position: "left" as const },
      { ...newsList[activeIndex], position: "center" as const },
      { ...newsList[nextIndex], position: "right" as const },
    ];
  };

  if (loading && newsList.length === 0) {
    return (
      <section className="py-32 bg-[#0a0a0a] flex justify-center items-center h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="animate-spin text-[#D8C97B] text-4xl" />
          <p className="text-gray-400 font-noto">
            {t("home.news_section.loading")}
          </p>
        </div>
      </section>
    );
  }

  if (!loading && newsList.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden text-white font-noto selection:bg-[rgba(216,201,123,0.3)]">
      <BackgroundDecoration />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.h2
            variants={scrollVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-wide mb-6 font-noto drop-shadow-xl"
          >
            {t("home.news_section.title")}{" "}
            <span className="text-[#D8C97B]">
              {t("home.news_section.highlight")}
            </span>
          </motion.h2>

          <motion.p
            variants={scrollVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl font-noto max-w-2xl mx-auto leading-relaxed "
          >
            {t("home.news_section.subtitle")}
          </motion.p>
        </div>

        <motion.div
          className="relative h-[550px] flex items-center justify-center group/carousel"
          variants={scrollVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <button
            onClick={handlePrev}
            aria-label="Previous news"
            className="absolute left-0 md:left-10 z-30 p-4 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-[#D8C97B] hover:text-black hover:border-[#D8C97B] transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:block"
          >
            <FaChevronLeft size={24} />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next news"
            className="absolute right-0 md:right-10 z-30 p-4 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-[#D8C97B] hover:text-black hover:border-[#D8C97B] transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:block"
          >
            <FaChevronRight size={24} />
          </button>

          <AnimatePresence mode="popLayout">
            {getVisibleItems().map((news, index) => (
              <NewsCard
                key={`${news.id}-${index}`}
                news={news}
                position={news.position}
                onDragStart={() => setIsPaused(true)}
                onDragEnd={onDragEnd}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={scrollVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          className="mt-12 flex justify-center relative z-20"
        >
          <Link
            to="/news"
            className="group relative inline-flex items-center gap-3 px-8 py-3 bg-transparent border border-[#D8C97B] text-[#D8C97B] font-bold text-sm uppercase tracking-widest rounded-full overflow-hidden transition-all duration-300 hover:text-black hover:shadow-[0_0_20px_rgba(216,201,123,0.4)]"
          >
            <span className="absolute inset-0 bg-[#D8C97B] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
            <span className="relative z-10">
              {t("home.news_section.view_all")}
            </span>
            <FaArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
