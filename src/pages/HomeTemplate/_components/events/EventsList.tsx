import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import type { AppDispatch, RootState } from "../../../../store";
import { fetchPublicEvents } from "../../../../store/slices/eventSlice";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useTranslation, Trans } from "react-i18next";

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

const formatDate = (isoString: string, locale: string = "vi") => {
  if (!isoString) return "TBA";
  const date = new Date(isoString);
  const loc = locale === "en" ? "en-US" : "vi-VN";
  return date.toLocaleDateString(loc, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

interface AllEventsSectionProps {
  searchTerm: string;
}

const ITEMS_PER_PAGE = 8;

export default function AllEventsSection({
  searchTerm,
}: AllEventsSectionProps) {
  const { t, i18n } = useTranslation();

  const dispatch = useDispatch<AppDispatch>();
  const { data: allEvents, isLoading } = useSelector(
    (state: RootState) => state.events,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const promise = dispatch(fetchPublicEvents());
    promise
      .unwrap()
      .catch(() => {})
      .finally(() => setIsFirstLoad(false));

    return () => {
      promise.abort();
    };
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredEvents = allEvents.filter((event) => {
    const matchesSearch = (event.eventName || "")
      .toLowerCase()
      .includes((searchTerm || "").toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEvents = filteredEvents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const section = document.getElementById("all-events-section");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const showLoading = isLoading || isFirstLoad;

  return (
    <section
      id="all-events-section"
      className="relative py-24 bg-[#0a0a0a] overflow-hidden font-noto text-white selection:bg-[rgba(216,201,123,0.3)]"
    >
      <BackgroundDecoration />

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl lg:text-6xl font-black uppercase mb-4 drop-shadow-2xl tracking-tight"
          >
            {t("events_page.all_events.title")}{" "}
            <span className="text-[#D8C97B]">
              {t("events_page.all_events.highlight")}
            </span>{" "}
            {t("events_page.all_events.subtitle_suffix")}
          </motion.h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
            {!showLoading && (
              <span>
                <Trans
                  i18nKey="events_page.all_events.found_result"
                  values={{ count: filteredEvents.length }}
                  components={{
                    0: <strong className="text-white" />,
                  }}
                />
              </span>
            )}
          </p>
        </div>

        {showLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[400px] bg-[#111] rounded-3xl animate-pulse border border-white/5"
              ></div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-24 bg-[#111] rounded-3xl border border-dashed border-white/10 max-w-2xl mx-auto">
            <p className="text-gray-500 text-xl font-light">
              {t("events_page.all_events.not_found", { term: searchTerm })}
            </p>
          </div>
        ) : (
          <>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimatePresence mode="wait">
                {currentEvents.map((event) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    key={event.eventId}
                    className="group relative h-[420px] bg-[#111] rounded-3xl border border-white/10 overflow-hidden hover:border-[#D8C97B]/50 hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                  >
                    <Link
                      to={`/event/${event.slug || event.eventId}`}
                      className="h-full flex flex-col"
                    >
                      <div className="relative h-1/2 overflow-hidden">
                        <OptimizedImage
                          src={event.bannerImageUrl}
                          alt={event.eventName}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          fallback="https://via.placeholder.com/400x300"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#111] to-transparent opacity-80"></div>

                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
                          <FaCalendarAlt className="text-[#D8C97B] text-xs" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            {/* Format ngày theo ngôn ngữ */}
                            {formatDate(event.startDate, i18n.language)}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1 relative">
                        <div className="flex items-center gap-2 mb-3 text-gray-500 text-xs">
                          <FaMapMarkerAlt className="text-[#D8C97B]" />
                          <span className="truncate max-w-[150px]">
                            {event.location ||
                              t("events_page.all_events.location_default")}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-snug group-hover:text-[#D8C97B] transition-colors">
                          {event.eventName}
                        </h3>

                        <div className="mt-auto border-t border-white/5 pt-4 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 group-hover:text-gray-400 transition-colors">
                            {event.organizerName ||
                              t("events_page.all_events.default_organizer")}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#D8C97B] transition-all duration-300">
                            <FaArrowRight className="text-gray-400 text-xs group-hover:text-black -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-16 gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#D8C97B] hover:text-black hover:border-[#D8C97B] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <FaChevronLeft />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                          currentPage === page
                            ? "bg-[#D8C97B] text-black shadow-[0_0_15px_rgba(216,201,123,0.4)]"
                            : "bg-transparent text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#D8C97B] hover:text-black hover:border-[#D8C97B] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
