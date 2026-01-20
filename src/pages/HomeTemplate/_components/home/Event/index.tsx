import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import apiService from "@/services/apiService";
import EventCard, { type Event } from "./EventCard";

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const getCardsPerView = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());

  useEffect(() => {
    const handleResize = () => setCardsPerView(getCardsPerView());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, events.length - cardsPerView);

  const scrollTo = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.scrollWidth / events.length;
    container.scrollTo({
      left: cardWidth * index,
      behavior: "smooth",
    });
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollTo(newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(maxIndex, currentIndex + 1);
    scrollTo(newIndex);
  };

  if (isLoading || events.length === 0) return null;

  return (
    <section className="relative py-16 md:py-24 bg-[#0a0a0a] overflow-hidden text-white font-noto selection:bg-[rgba(216,201,123,0.3)]">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: "radial-gradient(#D8C97B 1px, rgba(0,0,0,0) 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-[rgba(216,201,123,0.05)] to-transparent"></div>
      </div>

      <div className="container mx-auto relative z-10 max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-16 px-4"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 leading-snug uppercase text-white font-noto">
            SỰ KIỆN{" "}
            <span className="inline-block pt-2 pb-2 leading-normal text-transparent bg-clip-text bg-gradient-to-r from-[#D8C97B] to-[#F4E2A6] font-noto">
              NỔI BẬT
            </span>
          </h2>
          <p className="text-base md:text-xl text-gray-400 leading-relaxed max-w-3xl drop-shadow-md mx-auto font-light font-noto">
            Cập nhật những hoạt động sôi nổi và sự kiện đáng chú ý nhất sắp diễn
            ra tại hệ thống EMS.
          </p>
        </motion.div>

        <div className="relative">
          {events.length > cardsPerView && (
            <>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 lg:-translate-x-7 z-30 w-16 h-16 items-center justify-center rounded-full bg-[rgba(26,26,26,0.8)] backdrop-blur-xl border-2 border-[rgba(216,201,123,0.3)] text-[#D8C97B] hover:bg-[rgba(216,201,123,0.2)] hover:border-[rgba(216,201,123,0.6)] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.8)] hover:shadow-[0_8px_40px_rgba(216,201,123,0.5)] hover:scale-110 group/arrow"
                aria-label="Previous"
              >
                <FaChevronLeft className="text-xl group-hover/arrow:scale-125 transition-transform duration-300" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 lg: translate-x-7 z-30 w-16 h-16 items-center justify-center rounded-full bg-[rgba(26,26,26,0.8)] backdrop-blur-xl border-2 border-[rgba(216,201,123,0.3)] text-[#D8C97B] hover:bg-[rgba(216,201,123,0.2)] hover:border-[rgba(216,201,123,0.6)] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.8)] hover:shadow-[0_8px_40px_rgba(216,201,123,0.5)] hover:scale-110 group/arrow"
                aria-label="Next"
              >
                <FaChevronRight className="text-xl group-hover/arrow:scale-125 transition-transform duration-300" />
              </button>
            </>
          )}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="overflow-hidden px-2"
          >
            <div
              ref={scrollContainerRef}
              className="flex gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {events.map((event, index) => (
                <motion.div
                  key={event.eventId}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-22px)] snap-start"
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {events.length > cardsPerView && (
            <div className="flex justify-center gap-3 mt-10">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`relative h-3 rounded-full transition-all duration-500 ${
                    index === currentIndex ? "w-12" : "w-3 hover: w-6"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {index === currentIndex ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#E5D9B6] via-[#D8C97B] to-[#E5D9B6] rounded-full animate-gradient bg-[length:200%_100%]"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#D8C97B] to-[#E5D9B6] rounded-full blur-md opacity-75"></div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors duration-300"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14 md:mt-20"
        >
          <Link
            to="/events"
            className="group relative inline-flex items-center justify-center gap-3 px-12 py-3.5 md:px-14 md:py-4 overflow-hidden rounded-full bg-transparent border border-[#D8C97B] text-[#D8C97B] font-semibold uppercase tracking-[0.25em] hover:bg-[#D8C97B] hover:text-black transition-all duration-400 text-xs md:text-sm"
          >
            <span className="flex items-center gap-3">
              Xem Tất Cả Sự Kiện
              <FaArrowRight className="text-sm group-hover: translate-x-1 transition-transform duration-300" />
            </span>
          </Link>
        </motion.div>
      </div>

      <style>{`
        .scrollbar-hide: :-webkit-scrollbar {
          display: none;
        }
        @keyframes gradient {
          0%, 100% { background-position:  0% 50%; }
          50% { background-position:  100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
}
