import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaArrowRight,
  FaUserTie,
  FaClock,
} from "react-icons/fa";
import { SAMPLE_EVENTS } from "./event-data"; // Import Data
import type { Event } from "@/pages/HomeTemplate/_components/home/models/event"; // Import Model
// Import Model

// --- UTILS ---
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: `Th${date.getMonth() + 1}`,
    time: date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

// --- SUB-COMPONENT: EVENT CARD ---
const EventCard = ({ event }: { event: Event }) => {
  const dateInfo = formatDate(event.startDate);

  return (
    <div className="w-[380px] md:w-[420px] shrink-0 mx-5 relative group font-noto perspective-1000">
      <div className="relative h-full bg-[#121212] rounded-2xl overflow-hidden border border-white/10 group-hover:border-[#B5A65F]/80 transition-all duration-500 shadow-lg group-hover:shadow-[0_0_30px_rgba(181,166,95,0.2)] flex flex-col">
        {/* Image Area */}
        <div className="relative h-56 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-t from-[#121212] via-transparent to-transparent z-10 opacity-80"></div>
          <img
            src={event.bannerImageUrl}
            alt={event.eventName}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
          />
          {/* Badge Date */}
          <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md border border-[#B5A65F] rounded-lg p-2 text-center min-w-[60px] shadow-lg">
            <span className="block text-3xl font-bold text-[#B5A65F] leading-none drop-shadow-md">
              {dateInfo.day}
            </span>
            <span className="block text-xs text-white font-bold uppercase tracking-wider">
              {dateInfo.month}
            </span>
          </div>
          {/* Badge Status */}
          <div className="absolute top-4 left-4 z-20">
            <span
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg ${
                event.status === "OPEN"
                  ? "bg-green-500/80 text-white border border-green-400"
                  : "bg-[#B5A65F]/80 text-black border border-[#B5A65F]"
              }`}
            >
              {event.status === "OPEN" ? "Đang Mở" : "Sắp Diễn Ra"}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex flex-col grow relative z-20 -mt-6">
          <div className="inline-flex items-center gap-2 self-start bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-3 backdrop-blur-sm">
            <FaUserTie className="text-[#B5A65F] text-xs" />
            <span className="text-gray-300 text-[10px] uppercase font-bold tracking-wider">
              {event.organizerName}
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
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm line-clamp-2 mb-6 grow border-t border-white/5 pt-4">
            {event.description}
          </p>

          <button className="relative w-full py-3.5 rounded-xl overflow-hidden group/btn font-bold text-sm uppercase tracking-wider transition-all shadow-md">
            <div className="absolute inset-0 bg-gradient-to-r from-[#B5A65F] to-[#D8C97B] opacity-90 group-hover/btn:opacity-100 transition-opacity"></div>
            {/* Dùng class animate-shine-infinite đã config trong CSS */}
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shine-infinite"></div>
            <div className="relative z-10 flex items-center justify-center gap-2 text-black">
              Chi Tiết Sự Kiện{" "}
              <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function EventsSection() {
  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden text-white font-noto bg-stars-pattern">
      {/* Lớp phủ gradient dưới đáy cho mượt */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-linear-to-t from-[#B5A65F]/5 to-transparent"></div>
      </div>

      <div className="container mx-auto relative z-10 max-w-full overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 px-4"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight drop-shadow-2xl uppercase tracking-tight">
            SỰ KIỆN <span className="text-[#B5A65F]">NỔI BẬT</span>
          </h2>
          <p className="text-gray-400 text-lg font-light max-w-3xl mx-auto">
            Cập nhật những hoạt động sôi nổi và sự kiện đáng chú ý nhất tại
            Webie Vietnam.
          </p>
        </motion.div>

        {/* Carousel Infinite */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 1 }}
          className="relative w-full py-4"
        >
          {/* Gradient che 2 bên để tạo cảm giác vô tận */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>

          <div className="flex overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
              whileHover={{ animationPlayState: "paused" }} // Tạm dừng khi di chuột vào
            >
              {/* Nhân đôi mảng để tạo vòng lặp liền mạch */}
              {[...SAMPLE_EVENTS, ...SAMPLE_EVENTS].map((event, index) => (
                <EventCard key={`${event.eventId}-${index}`} event={event} />
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Button Xem Tất Cả */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="text-center mt-12"
        >
          <a
            href="/events"
            className="group relative inline-flex items-center gap-2 px-8 py-3 overflow-hidden rounded-full bg-transparent border border-[#B5A65F] text-[#B5A65F] font-bold uppercase hover:text-black transition-colors duration-300"
          >
            <span className="absolute inset-0 bg-[#B5A65F] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></span>
            <span className="relative z-10 flex items-center gap-2">
              Xem Tất Cả <FaArrowRight />
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
