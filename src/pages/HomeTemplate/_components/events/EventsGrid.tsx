import  { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaArrowRight, FaRegSadTear } from "react-icons/fa";
import type { AppDispatch, RootState } from "../../../../store";
import { fetchSelectedEvents } from "../../../../store/slices/eventSlice";

const ensureUTC = (isoString: string) =>
  isoString && !isoString.endsWith("Z") ? `${isoString}Z` : isoString;
const getEventDate = (isoString: string) => {
  if (!isoString) return { day: "--", month: "---", time: "--:--" };
  const d = new Date(ensureUTC(isoString));
  return {
    day: d.getDate(),
    month: d.toLocaleString("default", { month: "short" }),
    time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
  };
};

const EventSkeleton = () => (
  <div className="bg-[#121212] rounded-3xl h-[450px] animate-pulse border border-white/5" />
);

export default function EventsGrid({ searchTerm }: { searchTerm: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedEvents, isLoading, error } = useSelector(
    (state: RootState) => state.events
  );

  useEffect(() => {
    dispatch(fetchSelectedEvents());
  }, [dispatch]);

  const filteredEvents = selectedEvents.filter((e) =>
    (e.eventName || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  return (
    <section className="container mx-auto px-4 mb-32 font-noto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-20"
      >
        <span className="text-[#D8C97B] text-xs font-bold tracking-[0.3em] uppercase border-b border-[#D8C97B] pb-1 mb-4 inline-block">
          Discover Events
        </span>
        <h2 className="text-4xl md:text-6xl font-black uppercase text-white tracking-wide mb-2">
          SỰ KIỆN{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#F4E2A6]">
            SẮP TỚI
          </span>
        </h2>
        {!isLoading && (
          <p className="text-gray-500 italic text-sm mt-4">
            Đã tìm thấy {filteredEvents.length} kết quả phù hợp
          </p>
        )}
      </motion.div>

      {error && (
        <div className="text-center text-red-400 py-10">
          Failed to load events.
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <EventSkeleton key={n} />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-24 bg-[#121212] rounded-3xl border border-dashed border-white/10">
          <FaRegSadTear className="text-5xl mx-auto mb-4 text-gray-700" />
          <p className="text-gray-500 uppercase tracking-widest font-bold">
            Không có sự kiện nào
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEvents.map((event, index) => {
            const dateObj = getEventDate(event.startDate);
            return (
              <motion.div
                key={event.eventId}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer bg-[#050505]"
              >
                <Link
                  to={`/event/${event.slug || event.eventId}`}
                  className="block h-full"
                >
                  <div className="absolute inset-0">
                    <img
                      src={
                        event.bannerImageUrl ||
                        "https://via.placeholder.com/400x600"
                      }
                      alt={event.eventName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
                  </div>
                  <div className="absolute inset-0 border border-white/10 rounded-3xl transition-colors duration-300 group-hover:border-[#D8C97B]/50" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center min-w-[70px] group-hover:bg-[#D8C97B] group-hover:text-black transition-colors">
                        <span className="block text-xs font-bold uppercase tracking-wider opacity-80">
                          {dateObj.month}
                        </span>
                        <span className="block text-2xl font-black">
                          {dateObj.day}
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur border border-white/10 text-[10px] font-bold uppercase tracking-widest text-[#D8C97B]">
                        {event.status || "Upcoming"}
                      </div>
                    </div>
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-px w-6 bg-[#D8C97B] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                        <span className="text-[#D8C97B] text-[10px] font-bold tracking-[0.2em] uppercase truncate max-w-[150px]">
                          {event.location || "Online"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 leading-tight uppercase line-clamp-2 group-hover:text-[#D8C97B] transition-colors">
                        {event.eventName}
                      </h3>
                      <div className="flex items-center justify-between text-gray-400 text-xs border-t border-white/10 pt-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <span className="flex items-center gap-2">
                          <FaCalendarAlt /> {dateObj.time}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-white uppercase group-hover:text-[#D8C97B]">
                          Chi tiết <FaArrowRight />
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
    </section>
  );
}
