import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "@/utils/i18n-router";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaSpinner } from "react-icons/fa";
import type { AppDispatch, RootState } from "@/store";
import { fetchFeaturedEvents } from "@/store/slices/eventSlice";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useTranslation } from "react-i18next";

export default function HeroCarousel() {
  const { t } = useTranslation();

  const dispatch = useDispatch<AppDispatch>();
  const { featuredEvents, isLoading } = useSelector(
    (state: RootState) => state.events,
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    dispatch(fetchFeaturedEvents());
  }, [dispatch]);

  const displayData = (featuredEvents || []).filter((event) => {
    const now = new Date();
    const endDate = new Date(event.endDate);

    return endDate >= now;
  });
  useEffect(() => {
    if (displayData.length <= 1) return;
    const timer = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % displayData.length),
      6000,
    );
    return () => clearInterval(timer);
  }, [displayData.length]);

  if (isLoading) {
    return (
      <div className="h-[80vh] min-h-[600px] w-full bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <FaSpinner className="animate-spin text-[#D8C97B] text-4xl" />
        <p className="text-[#D8C97B] font-mono text-sm tracking-widest animate-pulse">
          {t("events_page.hero.loading")}
        </p>
      </div>
    );
  }

  if (displayData.length === 0) {
    return null;
  }

  const safeIndex = currentSlide % displayData.length;
  const currentData = displayData[safeIndex];

  const eventName =
    currentData.eventName || t("events_page.hero.default_title");

  const description =
    currentData.description ||
    (currentData as any).description ||
    t("events_page.hero.default_desc");

  const image =
    currentData.bannerImageUrl ||
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070";

  const link = `/event/${currentData.slug || currentData.eventId}`;

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
            <OptimizedImage
              src={image}
              alt={eventName}
              width={1920}
              height={1080}
              priority={true}
              className="w-full h-full"
              imgClassName="filter brightness-[0.6]"
              fallback="https://placehold.co/1920x1080"
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
                  {t("events_page.hero.label")}
                </span>
              </motion.div>

              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 uppercase tracking-tighter drop-shadow-2xl line-clamp-2 pb-2"
              >
                {eventName}
              </motion.h1>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-300 text-lg md:text-xl font-light max-w-2xl mb-10 leading-relaxed border-l-2 border-[#D8C97B]/50 pl-5 line-clamp-3"
              >
                {description}
              </motion.p>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  to={link}
                  className="group relative inline-flex items-center gap-4 px-8 py-4 bg-white/5 border border-[#D8C97B]/50 backdrop-blur-md text-white font-bold text-sm uppercase tracking-widest rounded-full overflow-hidden transition-all hover:bg-[#D8C97B] hover:text-black hover:border-[#D8C97B] hover:shadow-[0_0_30px_rgba(216,201,123,0.4)]"
                >
                  <span className="relative z-10">
                    {t("events_page.hero.btn_detail")}
                  </span>
                  <FaArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {displayData.length > 1 && (
        <div className="absolute bottom-12 right-6 md:right-12 z-20 flex flex-col items-end gap-4">
          <div className="text-white font-black text-4xl font-mono">
            0{safeIndex + 1}
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
                {idx === safeIndex && (
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
      )}
    </section>
  );
}
