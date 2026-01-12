import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaArrowRight,
  FaUserTie,
  FaClock,
} from "react-icons/fa";

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

const EventCard = ({
  event,
  className = "",
}: {
  event: Event;
  className?: string;
}) => {
  const dateInfo = formatDate(event.startDate);

  return (
    <Link
      to={`/event/${event.slug || event.eventId}`}
      className={`block h-full ${className}`}
    >
      <div className="w-[calc(100vw-48px)] md:w-[420px] shrink-0 relative group font-sans perspective-1000 h-full">
        <div className="relative h-full bg-[#121212] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)] group-hover:border-[rgba(181,166,95,0.8)] transition-all duration-500 shadow-lg group-hover:shadow-[0_0_30px_rgba(181,166,95,0.2)] flex flex-col">
          {/* Banner Image */}
          <div className="relative h-48 md:h-56 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-t from-[#121212] via-[rgba(18,18,18,0)] to-[rgba(18,18,18,0)] z-10 opacity-80"></div>
            <img
              src={
                event.bannerImageUrl ||
                "https://via.placeholder.com/600x400?text=Event+Image"
              }
              alt={event.eventName}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
            />
            {/* Date Badge */}
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 bg-[rgba(0,0,0,0.6)] backdrop-blur-md border border-[#B5A65F] rounded-lg p-2 text-center min-w-[50px] md:min-w-[60px] shadow-lg">
              <span className="block text-2xl md:text-3xl font-bold text-[#B5A65F] leading-none drop-shadow-md">
                {dateInfo.day}
              </span>
              <span className="block text-[10px] md:text-xs text-white font-bold uppercase tracking-wider">
                {dateInfo.month}
              </span>
            </div>
            {/* Status Badge */}
            <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
              <span
                className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg ${
                  event.status === "OPEN"
                    ? "bg-[rgba(34,197,94,0.8)] text-white border border-green-400"
                    : "bg-[rgba(181,166,95,0.8)] text-black border border-[#B5A65F]"
                }`}
              >
                {event.status === "OPEN"
                  ? "Đang Mở"
                  : event.status || "Sắp Diễn Ra"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 md:p-6 flex flex-col grow relative z-20 -mt-6">
            <div className="inline-flex items-center gap-2 self-start bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1 mb-3 backdrop-blur-sm">
              <FaUserTie className="text-[#B5A65F] text-xs" />
              <span className="text-gray-300 text-[10px] uppercase font-bold tracking-wider max-w-[150px] md:max-w-[200px] truncate">
                {event.organizerName || "EMS Organizer"}
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-white mb-3 line-clamp-2 leading-snug group-hover:text-[#B5A65F] transition-colors duration-300 min-h-14">
              {event.eventName}
            </h3>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 text-gray-400 text-xs md:text-sm">
                <FaClock className="text-[#B5A65F]" />
                <span>{dateInfo.time}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-xs md:text-sm">
                <FaMapMarkerAlt className="text-[#B5A65F] shrink-0" />
                <span className="truncate">{event.location || "Online"}</span>
              </div>
            </div>

            <p className="text-gray-500 text-xs md:text-sm line-clamp-2 mb-6 grow border-t border-[rgba(255,255,255,0.05)] pt-4">
              {event.description || "Chưa có mô tả cho sự kiện này."}
            </p>

            <button className="relative w-full py-3 md:py-3.5 rounded-xl overflow-hidden group/btn font-bold text-xs md:text-sm uppercase tracking-wider transition-all shadow-md mt-auto">
              <div className="absolute inset-0 bg-linear-to-r from-[#B5A65F] to-[#8E803C] opacity-90 group-hover/btn:opacity-100 transition-opacity"></div>
              <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-[rgba(255,255,255,0)] via-[rgba(255,255,255,0.4)] to-[rgba(255,255,255,0)] -skew-x-12 animate-shine-infinite pointer-events-none"></div>

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

export default EventCard;
