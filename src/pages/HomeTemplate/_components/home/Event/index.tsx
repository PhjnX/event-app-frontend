import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import apiService from "@/services/apiService";
import EventCard, { type Event } from "./EventCard";
import { useTranslation } from "react-i18next";

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

const scrollVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function EventsSection() {
  const { t } = useTranslation();

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res: any = await apiService.get("/events/public");
        let list = [];
        if (Array.isArray(res)) list = res;
        else if (res.content && Array.isArray(res.content)) list = res.content;
        setEvents(list);
      } catch (error) {
        console.error("Lỗi lấy danh sách sự kiện:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleCount(1);
      else if (width < 1024) setVisibleCount(3);
      else setVisibleCount(5);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const paginate = (newDirection: number) => {
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (events.length === 0) return 0;
      if (nextIndex < 0) nextIndex = events.length - 1;
      else if (nextIndex >= events.length) nextIndex = 0;
      return nextIndex;
    });
  };

  if (isLoading || events.length === 0) return null;

  const getVisibleItems = () => {
    const offset = Math.floor(visibleCount / 2);
    const items = [];
    for (let i = -offset; i <= offset; i++) {
      let index = (currentIndex + i) % events.length;
      if (index < 0) index += events.length;
      items.push({
        ...events[index],
        virtualId: `${events[index].eventId}-pos-${i}`,
        isCenter: i === 0,
        offset: i,
      });
    }
    return items;
  };

  const visibleItems = getVisibleItems();
  const displayNumber = currentIndex + 1;
  const totalNumber = events.length;
  const progressPercent = ((currentIndex + 1) / totalNumber) * 100;

  return (
    <section className="relative py-20 md:py-32 bg-[#020202] overflow-hidden text-white font-noto select-none">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#020202]"></div>
      </div>

      <div className="container mx-auto relative z-10 max-w-[1600px] px-4 md:px-8">
        <motion.div
          variants={scrollVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          className="text-center mb-12 md:mb-16 px-4"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 leading-snug uppercase text-white font-noto tracking-tight">
            {t("home.events_section.title")}{" "}
            <span className="inline-block pt-2 pb-2 leading-normal text-transparent bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#F4E2A6] font-noto">
              {t("home.events_section.highlight")}
            </span>
          </h2>
          <p className="text-base md:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto font-light font-noto">
            {t("home.events_section.subtitle")}
          </p>
        </motion.div>

        <motion.div
          className="relative group/slider min-h-[400px] flex flex-col justify-center"
          variants={scrollVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <div className="overflow-visible px-1 py-4 cursor-grab active:cursor-grabbing z-20">
            <motion.div
              className="flex items-center justify-center gap-4 md:gap-6 lg:gap-8"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(_e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) paginate(1);
                else if (swipe > swipeConfidenceThreshold) paginate(-1);
              }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {visibleItems.map((item) => (
                  <motion.div
                    key={item.virtualId}
                    layout
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{
                      scale: item.isCenter ? 1.05 : 0.9,
                      opacity: item.isCenter ? 1 : 0.5,
                      zIndex: item.isCenter ? 10 : 0,
                      filter: item.isCenter ? "blur(0px)" : "blur(1px)",
                      x: 0,
                    }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="shrink-0 relative"
                    style={{
                      width: `calc((100% - ${(visibleCount - 1) * (window.innerWidth < 1024 ? 16 : 32)}px) / ${visibleCount})`,
                      maxWidth: "350px",
                    }}
                  >
                    <div className="pointer-events-none h-full">
                      <div className="pointer-events-auto h-full select-none">
                        <EventCard event={item} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="mt-12 flex items-end justify-between border-t border-white/5 pt-6 mx-4 md:mx-0 relative z-10">
            <div className="hidden md:block text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
              {t("home.events_section.drag_hint")}
            </div>
            <div className="flex items-center gap-6 ml-auto w-full md:w-auto justify-end">
              <div className="grow md:w-48 lg:w-64 h-0.5 bg-[#222] relative overflow-hidden rounded-full">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-[#D8C97B]"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              </div>
              <div className="flex items-baseline gap-1.5 font-noto font-bold shrink-0">
                <span className="text-xl md:text-2xl text-[#D8C97B] leading-none tabular-nums">
                  {formatNumber(displayNumber)}
                </span>
                <span className="text-sm md:text-lg text-gray-600 font-light">
                  /
                </span>
                <span className="text-xs md:text-sm text-gray-500 leading-none tabular-nums font-medium">
                  {formatNumber(totalNumber)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={scrollVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="text-center mt-12 md:mt-20 relative z-10"
        >
          <Link
            to="/events"
            className="group relative inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D8C97B] hover:text-[#F4E2A6] transition-colors py-2"
            style={{ WebkitFontSmoothing: "antialiased" }}
          >
            <span>{t("home.events_section.view_all")}</span>
            <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform duration-300" />
            <span className="absolute bottom-0 left-0 w-0 h-px bg-[#D8C97B] transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
