import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import type { AppDispatch, RootState } from "@/store";
import { fetchFeaturedEvents } from "@/store/slices/eventSlice";

export default function HeroCarousel() {
  const dispatch = useDispatch<AppDispatch>();
  const { featuredEvents, isLoading } = useSelector(
    (state: RootState) => state.events
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    dispatch(fetchFeaturedEvents());
  }, [dispatch]);

  const displayData =
    featuredEvents.length > 0
      ? featuredEvents
      : [
          {
            eventId: 999,
            eventName: "TECH SUMMIT 2025",
            shortDescription:
              "Đại hội công nghệ lớn nhất năm - Nơi quy tụ những bộ óc vĩ đại.",
            bannerImageUrl:
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070",
            slug: "tech-summit-2025",
            startTime: "2025-12-20T09:00:00",
          },
          {
            eventId: 888,
            eventName: "MUSIC FESTIVAL",
            shortDescription: "Bùng nổ cảm xúc với âm nhạc điện tử đỉnh cao.",
            bannerImageUrl:
              "https://images.unsplash.com/photo-1470229722913-7c0d2dbbafd3?auto=format&fit=crop&q=80&w=2070",
            slug: "music-fest",
            startTime: "2025-11-15T18:00:00",
          },
        ];

  useEffect(() => {
    if (displayData.length <= 1) return;
    const timer = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % displayData.length),
      6000
    );
    return () => clearInterval(timer);
  }, [displayData.length]);

  if (isLoading)
    return <div className="h-[75vh] w-full bg-[#0a0a0a] animate-pulse" />;

  const currentData = displayData[currentSlide];

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden bg-[#0a0a0a] font-noto group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentData.eventId}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "linear" }}
          >
            <img
              src={currentData.bannerImageUrl}
              alt={currentData.eventName}
              className="w-full h-full object-cover filter brightness-[0.6]"
            />
          </motion.div>

          <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-[#0a0a0a]/90 via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-center container mx-auto px-6 md:px-12">
            <div className="max-w-4xl relative z-10">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 mb-4"
              >
                <span className="w-10 h-0.5 bg-[#D8C97B]"></span>
                <span className="text-[#D8C97B] font-bold text-sm tracking-[0.3em] uppercase">
                  Featured Event
                </span>
              </motion.div>

              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none mb-6 uppercase tracking-tighter drop-shadow-2xl"
              >
                {currentData.eventName}
              </motion.h1>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-300 text-lg md:text-xl font-light max-w-2xl mb-10 leading-relaxed border-l-2 border-[#D8C97B]/50 pl-5"
              >
                {(currentData as any).shortDescription}
              </motion.p>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  to={`/event/${currentData.slug || currentData.eventId}`}
                  className="group relative inline-flex items-center gap-4 px-8 py-4 bg-white/5 border border-[#D8C97B]/50 backdrop-blur-md text-white font-bold text-sm uppercase tracking-widest rounded-full overflow-hidden transition-all hover:bg-[#D8C97B] hover:text-black hover:border-[#D8C97B] hover:shadow-[0_0_30px_rgba(216,201,123,0.4)]"
                >
                  <span className="relative z-10">Đặt Vé Ngay</span>
                  <FaArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-12 right-6 md:right-12 z-20 flex flex-col items-end gap-4">
        {/* Slide Numbers */}
        <div className="text-white font-black text-4xl font-mono">
          0{currentSlide + 1}
          <span className="text-lg text-gray-500 font-medium">
            /0{displayData.length}
          </span>
        </div>

        <div className="flex gap-2">
          {displayData.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="h-1 rounded-full cursor-pointer bg-white/20 w-12 overflow-hidden"
            >
              {idx === currentSlide && (
                <motion.div
                  className="h-full bg-[#D8C97B]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
