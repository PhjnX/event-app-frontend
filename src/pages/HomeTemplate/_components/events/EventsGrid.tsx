import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaArrowRight, FaRegSadTear } from "react-icons/fa";
import type { AppDispatch, RootState } from "../../../../store";
import { fetchSelectedEvents } from "../../../../store/slices/eventSlice";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useTranslation } from "react-i18next";

const ensureUTC = (isoString: string) =>
  isoString && !isoString.endsWith("Z") ? `${isoString}Z` : isoString;

const getEventDate = (isoString: string, locale: string = "vi") => {
  if (!isoString) return { day: "--", month: "---", time: "--:--" };
  const d = new Date(ensureUTC(isoString));
  const loc = locale === "en" ? "en-US" : "vi-VN";

  return {
    day: d.getDate(),
    month: d.toLocaleString(loc, { month: "short" }),
    time: d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" }),
  };
};

const EventSkeleton = () => (
  <div className="bg-[#0a0a0a] rounded-3xl h-[450px] animate-pulse border border-white/5" />
);

const BackgroundDecoration = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <div
      className="absolute inset-0 opacity-[0.1]"
      style={{
        backgroundImage: `radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)`,
        backgroundSize: "30px 30px",
      }}
    />
    <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#020202]"></div>
  </div>
);

export default function EventsGrid({ searchTerm }: { searchTerm: string }) {
  const { t, i18n } = useTranslation();

  const dispatch = useDispatch<AppDispatch>();
  const { selectedEvents, isLoading, error } = useSelector(
    (state: RootState) => state.events,
  );

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const promise = dispatch(fetchSelectedEvents());

    promise
      .unwrap()
      .catch(() => {})
      .finally(() => setIsFirstLoad(false));

    return () => {
      promise.abort();
    };
  }, [dispatch]);

  const filteredEvents = selectedEvents.filter((e) =>
    (e.eventName || "")
      .toLowerCase()
      .includes((searchTerm || "").toLowerCase()),
  );

  const showLoading = isLoading || isFirstLoad;

  return (
    <section className="relative py-24 bg-[#020202] overflow-hidden font-noto text-white selection:bg-[#D8C97B] selection:text-black">
      <BackgroundDecoration />

      <div className="container mx-auto px-4 relative z-10 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-black uppercase text-white leading-snug mb-2 drop-shadow-xl">
            {t("events_page.events_grid.title")}{" "}
            <span className="inline-block pt-2 pb-2 leading-normal text-transparent bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#F4E2A6]">
              {t("events_page.events_grid.highlight")}
            </span>
          </h2>
          {!showLoading && (
            <p className="text-gray-500 italic text-sm mt-4 font-light">
              {t("events_page.events_grid.result_count", {
                count: filteredEvents.length,
              })}
            </p>
          )}
        </motion.div>

        {error && (
          <div className="text-center text-red-400 py-10 bg-red-500/10 rounded-xl border border-red-500/20 max-w-2xl mx-auto">
            {t("events_page.events_grid.error")}
          </div>
        )}

        {showLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <EventSkeleton key={n} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-24 bg-[#0a0a0a] rounded-3xl border border-dashed border-white/10 max-w-3xl mx-auto">
            <FaRegSadTear className="text-5xl mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 uppercase tracking-widest font-bold">
              {t("events_page.events_grid.empty")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event, index) => {
              const dateObj = getEventDate(event.startDate, i18n.language);

              return (
                <motion.div
                  key={event.eventId}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer bg-[#0a0a0a] border border-white/5 hover:border-[#D8C97B]/50 transition-colors duration-300"
                >
                  <Link
                    to={`/event/${event.slug || event.eventId}`}
                    className="block h-full"
                  >
                    <div className="absolute inset-0">
                      <OptimizedImage
                        src={event.bannerImageUrl}
                        alt={event.eventName}
                        width={400}
                        height={450}
                        className="w-full h-full"
                        imgClassName="transition-transform duration-700 group-hover:scale-110 object-cover"
                        fallback="https://via.placeholder.com/400x600"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />
                    </div>

                    <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                      <div className="flex justify-between items-start">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center min-w-[70px] group-hover:bg-[#D8C97B] group-hover:text-black transition-colors duration-300 shadow-lg">
                          <span className="block text-xs font-bold uppercase tracking-wider opacity-80">
                            {dateObj.month}
                          </span>
                          <span className="block text-2xl font-black">
                            {dateObj.day}
                          </span>
                        </div>

                        <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur border border-white/10 text-[10px] font-bold uppercase tracking-widest text-[#D8C97B] shadow-sm">
                          {event.status ||
                            t("events_page.events_grid.card.status_default")}
                        </div>
                      </div>

                      <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-px w-6 bg-[#D8C97B] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                          <span className="text-[#D8C97B] text-[10px] font-bold tracking-[0.2em] uppercase truncate max-w-[150px]">
                            {event.location ||
                              t(
                                "events_page.events_grid.card.location_default",
                              )}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-3 leading-tight uppercase line-clamp-2 group-hover:text-[#D8C97B] transition-colors">
                          {event.eventName}
                        </h3>

                        <div className="flex items-center justify-between text-gray-400 text-xs border-t border-white/10 pt-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                          <span className="flex items-center gap-2">
                            <FaCalendarAlt className="text-[#D8C97B]" />{" "}
                            {dateObj.time}
                          </span>
                          <span className="flex items-center gap-1 font-bold text-white uppercase group-hover:text-[#D8C97B] transition-colors">
                            {t("events_page.events_grid.card.details")}{" "}
                            <FaArrowRight />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
