import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import apiService from "@/services/apiService";
import EventCard, { type Event } from "./EventCard";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

export default function EventsSection() {
  const { t, i18n } = useTranslation();
  const [originalEvents, setOriginalEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const fetchEvents = async () => {
      try {
        const res: any = await apiService.get("/events/public");
        let list = [];
        if (Array.isArray(res)) list = res;
        else if (res.content && Array.isArray(res.content)) list = res.content;

        setOriginalEvents(list);
      } catch (error) {
        console.error("Lỗi lấy danh sách sự kiện:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const displayEvents = useMemo(() => {
    if (originalEvents.length === 0) return [];
    if (isMobile) return originalEvents;
    return [...originalEvents, ...originalEvents, ...originalEvents];
  }, [originalEvents, isMobile]);

  useAnimationFrame(() => {
    if (
      isMobile ||
      isPaused ||
      !containerRef.current ||
      originalEvents.length === 0
    ) {
      return;
    }

    const moveBy = -0.3;
    const currentX = x.get();

    const resetPoint = containerRef.current.scrollWidth / 3;

    if (currentX <= -resetPoint) {
      x.set(0);
    } else {
      x.set(currentX + moveBy);
    }
  });

  if (isLoading || originalEvents.length === 0) return null;

  return (
    <section className="relative py-16 md:py-32 bg-[#020202] overflow-hidden text-white font-noto select-none">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto relative z-10 max-w-[1600px] px-4 md:px-8">
        <div className="text-center mb-10 md:mb-16 px-4">
          <h2 className="text-2xl md:text-5xl lg:text-6xl font-black mb-4 uppercase tracking-tight leading-[1.6] pb-2">
            {t("home.events_section.title")}{" "}
            <span className="inline-block text-transparent bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#F4E2A6] pb-2">
              {t("home.events_section.highlight")}
            </span>
          </h2>
          <p className="text-sm md:text-xl text-gray-400 max-w-3xl mx-auto font-light">
            {t("home.events_section.subtitle")}
          </p>
        </div>

        <div
          className={`relative ${
            isMobile
              ? "overflow-x-auto snap-x snap-mandatory custom-scrollbar-hide px-4"
              : "overflow-visible"
          }`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            ref={containerRef}
            style={isMobile ? { x: 0 } : { x }}
            className="flex flex-nowrap gap-4 md:gap-6 w-max"
          >
            {displayEvents.map((item, idx) => (
              <div
                key={`${item.eventId}-${idx}`}
                className={`flex-none ${isMobile ? "snap-center" : ""}`}
                style={{
                  width: isMobile
                    ? "calc(100vw - 48px)"
                    : window.innerWidth >= 1024
                      ? `calc((100vw - 120px - (3 * 24px)) / 4)`
                      : "300px",
                  maxWidth: isMobile ? "none" : "380px",
                }}
              >
                <div className="h-full cursor-pointer">
                  <EventCard event={item} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="text-center mt-12 md:mt-20">
          <Link
            to={`/${i18n.language}/events`}
            className="group relative inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D8C97B] hover:text-[#F4E2A6] transition-colors py-2"
          >
            <span>{t("home.events_section.view_all")}</span>
            <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
            <span className="absolute bottom-0 left-0 w-0 h-px bg-[#D8C97B] transition-all group-hover:w-full"></span>
          </Link>
        </div>
      </div>
    </section>
  );
}
