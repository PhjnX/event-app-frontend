import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import type { AppDispatch, RootState } from "@/store";
import { fetchFeaturedEvents } from "@/store/slices/eventSlice";

const shineKeyframes = `@keyframes shine { 0% { left: -100%; } 100% { left: 200%; } } .animate-shine-infinite { animation: shine 3s infinite linear; }`;

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
            eventName: "SỰ KIỆN CÔNG NGHỆ 2025",
            shortDescription: "Khám phá tương lai AI",
            bannerImageUrl:
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070",
            slug: "tech-summit-2025",
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
    return <div className="h-[650px] w-full bg-[#0a0a0a] animate-pulse" />;

  const currentData = displayData[currentSlide];

  return (
    <>
      <style>{shineKeyframes}</style>
      <section className="relative h-[650px] w-full overflow-hidden bg-[#0a0a0a] font-noto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentData.eventId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-black/50 z-10" />
            <div className="absolute inset-0 bg-linear-to-r from-black via-black/60 to-transparent z-10" />
            <img
              src={currentData.bannerImageUrl}
              alt={currentData.eventName}
              className="w-full h-full object-cover filter grayscale-30 contrast-125"
            />

            <div className="absolute inset-0 z-20 flex flex-col justify-center px-4 md:px-0 container mx-auto">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="max-w-4xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-12 bg-[#D8C97B]"></div>
                  <span className="text-[#D8C97B] text-xs font-bold tracking-[0.3em] uppercase">
                    Featured Event
                  </span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black uppercase text-white mb-6 leading-[0.9] tracking-tight">
                  {currentData.eventName}
                </h1>
                <p className="text-gray-300 text-lg md:text-xl font-light italic mb-10 pl-1 border-l-2 border-[#D8C97B]/50 max-w-2xl">
                  {(currentData as any).shortDescription ||
                    "Trải nghiệm đỉnh cao."}
                </p>
                <Link
                  to={`/event/${currentData.slug || currentData.eventId}`}
                  className="group relative inline-flex items-center gap-3 px-10 py-4 bg-linear-to-r from-[#D8C97B] to-[#F4E2A6] text-black font-bold text-sm uppercase tracking-wider rounded-full overflow-hidden transition-all hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Xem chi tiết <FaArrowRight />
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-10 right-10 z-30 flex flex-col gap-3">
          {displayData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-1 transition-all duration-500 rounded-full ${
                idx === currentSlide
                  ? "bg-[#D8C97B] h-16 opacity-100"
                  : "bg-white/20 h-8 hover:bg-white hover:h-10"
              }`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
