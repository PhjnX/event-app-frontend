import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaArrowRight,
  FaUserTie,
  FaClock,
} from "react-icons/fa";
import apiService from "@/services/apiService"; 

export interface Event {
  eventId: number;
  eventName: string;
  startDate: string;
  location?: string;
  description?: string;
  bannerImageUrl?: string;
  organizerName?: string;
  status?: string;
  slug?: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return { day: "--", month: "---", time: "--:--" };
  const date = new Date(
    dateString.endsWith("Z") ? dateString : dateString + "Z"
  );
  return {
    day: date.getDate(),
    month: `Th${date.getMonth() + 1}`,
    time: date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const EventCard = ({ event }: { event: Event }) => {
  const dateInfo = formatDate(event.startDate);

  return (
    <Link to={`/event/${event.slug || event.eventId}`} className="block">
      <div className="w-[380px] md:w-[420px] shrink-0 mx-5 relative group font-sans perspective-1000 h-full">
        <div className="relative h-full bg-[#121212] rounded-2xl overflow-hidden border border-white/10 group-hover:border-[#B5A65F]/80 transition-all duration-500 shadow-lg group-hover:shadow-[0_0_30px_rgba(181,166,95,0.2)] flex flex-col">
          {/* Banner Image */}
          <div className="relative h-56 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-t from-[#121212] via-transparent to-transparent z-10 opacity-80"></div>
            <img
              src={
                event.bannerImageUrl ||
                "https://via.placeholder.com/600x400?text=Event+Image"
              }
              alt={event.eventName}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
            />
            <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md border border-[#B5A65F] rounded-lg p-2 text-center min-w-[60px] shadow-lg">
              <span className="block text-3xl font-bold text-[#B5A65F] leading-none drop-shadow-md">
                {dateInfo.day}
              </span>
              <span className="block text-xs text-white font-bold uppercase tracking-wider">
                {dateInfo.month}
              </span>
            </div>
            <div className="absolute top-4 left-4 z-20">
              <span
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg ${
                  event.status === "OPEN"
                    ? "bg-green-500/80 text-white border border-green-400"
                    : "bg-[#B5A65F]/80 text-black border border-[#B5A65F]"
                }`}
              >
                {event.status === "OPEN"
                  ? "Đang Mở"
                  : event.status || "Sắp Diễn Ra"}
              </span>
            </div>
          </div>

          <div className="p-6 flex flex-col grow relative z-20 -mt-6">
            <div className="inline-flex items-center gap-2 self-start bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-3 backdrop-blur-sm">
              <FaUserTie className="text-[#B5A65F] text-xs" />
              <span className="text-gray-300 text-[10px] uppercase font-bold tracking-wider max-w-[200px] truncate">
                {event.organizerName || "EMS Organizer"}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-snug group-hover:text-[#B5A65F] transition-colors duration-300 min-h-14">
              {event.eventName}
            </h3>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <FaClock className="text-[#B5A65F]" />
                <span>{dateInfo.time}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <FaMapMarkerAlt className="text-[#B5A65F] shrink-0" />
                <span className="truncate">{event.location || "Online"}</span>
              </div>
            </div>

            <p className="text-gray-500 text-sm line-clamp-2 mb-6 grow border-t border-white/5 pt-4">
              {event.description || "Chưa có mô tả cho sự kiện này."}
            </p>

            <button className="relative w-full py-3.5 rounded-xl overflow-hidden group/btn font-bold text-sm uppercase tracking-wider transition-all shadow-md mt-auto">
              <div className="absolute inset-0 bg-linear-to-r from-[#B5A65F] to-[#8E803C] opacity-90 group-hover/btn:opacity-100 transition-opacity"></div>
              <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shine-infinite pointer-events-none"></div>

              <div className="relative z-10 flex items-center justify-center gap-2 text-black">
                Chi Tiết{" "}
                <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res: any = await apiService.get("/events/public");

        let list = [];
        if (Array.isArray(res)) list = res;
        else if (res.content && Array.isArray(res.content)) list = res.content;

        if (list.length > 0 && list.length < 4) {
          list = [...list, ...list, ...list];
        } else if (list.length >= 4 && list.length < 8) {
          list = [...list, ...list];
        }

        setEvents(list);
      } catch (error) {
        console.error("Lỗi lấy danh sách sự kiện marquee:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) return null; 
  if (events.length === 0) return null; 

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden text-white font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#B5A65F_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-linear-to-t from-[#B5A65F]/5 to-transparent"></div>
      </div>

      <div className="container mx-auto relative z-10 max-w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 px-4"
        >
          <span className="text-[#B5A65F] text-xs font-bold tracking-[0.3em] uppercase mb-3 block">
            What's Trending
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight uppercase tracking-tight text-white">
            SỰ KIỆN{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#B5A65F] to-[#F4E2A6]">
              NỔI BẬT
            </span>
          </h2>
          <div className="w-20 h-1 bg-[#B5A65F] mx-auto rounded-full mb-6"></div>
          <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto">
            Cập nhật những hoạt động sôi nổi và sự kiện đáng chú ý nhất sắp diễn
            ra tại hệ thống EMS.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative w-full py-4"
        >
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-linear-to-r from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-linear-to-l from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>

          <div className="flex overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: events.length * 8, 
                  ease: "linear",
                },
              }}
              whileHover={{ animationPlayState: "paused" }} 
              style={{ width: "max-content" }} 
            >
              {[...events, ...events].map((event, index) => (
                <EventCard
                  key={`${event.eventId}-loop-${index}`}
                  event={event}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/events"
            className="group relative inline-flex items-center gap-2 px-10 py-3.5 overflow-hidden rounded-full bg-transparent border border-[#B5A65F] text-[#B5A65F] font-bold uppercase tracking-wider hover:text-black transition-colors duration-300"
          >
            <span className="absolute inset-0 bg-[#B5A65F] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></span>
            <span className="relative z-10 flex items-center gap-2">
              Xem Tất Cả <FaArrowRight />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
