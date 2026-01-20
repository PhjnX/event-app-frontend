import { Link } from "react-router-dom";
import { memo } from "react";
import {
  FaMapMarkerAlt,
  FaArrowRight,
  FaUserTie,
  FaClock,
} from "react-icons/fa";
import OptimizedImage from "@/components/ui/OptimizedImage";

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
  if (!dateString) return { day: "--", month: "TH-", time: "--: --" };
  const date = new Date(
    dateString.endsWith("Z") ? dateString : dateString + "Z",
  );
  return {
    day: date.getDate(),
    month: `TH${date.getMonth() + 1}`,
    time: date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const EventCard = memo(({
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
      <div className="group relative h-full bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#141414] rounded-3xl overflow-hidden border border-[rgba(216,201,123,0.2)] hover:border-[rgba(216,201,123,0.6)] transition-all duration-700 shadow-[0_10px_40px_rgba(0,0,0,0.7)] hover:shadow-[0_20px_60px_rgba(216,201,123,0.4)] hover:-translate-y-3 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(216,201,123,0.05)] via-transparent to-[rgba(216,201,123,0.08)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        <div className="relative h-52 overflow-hidden">
          <OptimizedImage
            src={event.bannerImageUrl}
            alt={event.eventName}
            width={420}
            height={208}
            className="w-full h-full"
            imgClassName="transform group-hover:scale-[1.15] group-hover:rotate-2 transition-all duration-1000 ease-out object-cover brightness-90 group-hover:brightness-100"
            fallback="https://via.placeholder.com/600x400? text=Event+Image"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[rgba(26,26,26,0.4)] to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(216,201,123,0.15)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          <div className="absolute top-4 right-4 z-20 group/date">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E5D9B6] to-[#D8C97B] rounded-2xl blur-xl opacity-50 group-hover/date:opacity-75 transition-opacity duration-300"></div>

              <div className="relative bg-gradient-to-br from-[#E5D9B6] via-[#D8C97B] to-[#C9BA6A] rounded-2xl p-4 shadow-[0_8px_25px_rgba(216,201,123,0.5)] min-w-[70px] text-center transform group-hover/date:scale-110 group-hover/date:rotate-3 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-2xl"></div>

                <span className="relative block text-3xl font-black text-black leading-none drop-shadow-md">
                  {dateInfo.day}
                </span>
                <span className="relative block text-[10px] text-black/80 font-bold uppercase tracking-widest mt-1">
                  {dateInfo.month}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge - Modern Pill */}
          <div className="absolute top-4 left-4 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D8C97B] rounded-xl blur-md opacity-60"></div>
              <span className="relative inline-block px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] bg-gradient-to-r from-[#E5D9B6] to-[#D8C97B] text-black shadow-lg">
                PUBLISHED
              </span>
            </div>
          </div>
        </div>

        <div className="relative p-6 flex flex-col">
          <div className="inline-flex items-center gap-2. 5 self-start mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-[rgba(216,201,123,0.2)] via-[rgba(216,201,123,0.15)] to-transparent border border-[rgba(216,201,123,0.3)] backdrop-blur-sm group-hover: border-[rgba(216,201,123,0.5)] transition-all duration-500">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E5D9B6] to-[#D8C97B] flex items-center justify-center shadow-lg">
              <FaUserTie className="text-black text-[10px]" />
            </div>
            <span className="text-[#D8C97B] text-xs uppercase font-black tracking-wider truncate max-w-[180px]">
              {event.organizerName || "TIT EVENT"}
            </span>
          </div>

          <h3 className="text-xl font-black text-white mb-4 line-clamp-2 leading-snug min-h-14 group-hover:inline-block group-hover:pt-2 group-hover:pb-2 group-hover:bg-gradient-to-r group-hover:from-[#E5D9B6] group-hover:to-[#D8C97B] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
            {event.eventName}
          </h3>

          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[rgba(216,201,123,0.2)] to-[rgba(216,201,123,0.05)] border border-[rgba(216,201,123,0.25)] shadow-inner">
                <FaClock className="text-[#D8C97B] text-xs" />
              </div>
              <span className="text-gray-300 text-sm font-semibold">
                {dateInfo.time}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[rgba(216,201,123,0.2)] to-[rgba(216,201,123,0.05)] border border-[rgba(216,201,123,0.25)] shadow-inner shrink-0">
                <FaMapMarkerAlt className="text-[#D8C97B] text-xs" />
              </div>
              <span className="text-gray-300 text-sm font-medium line-clamp-2 leading-relaxed">
                {event.location || "Online"}
              </span>
            </div>
          </div>

          <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed grow">
            {event.description ||
              "Khám phá sự kiện đặc sắc với nhiều hoạt động thú vị và bổ ích. "}
          </p>

          <button className="relative w-full py-4 rounded-2xl overflow-hidden group/btn transition-all duration-500 shadow-[0_4px_20px_rgba(216,201,123,0.3)] hover:shadow-[0_8px_35px_rgba(216,201,123,0.6)]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E5D9B6] via-[#D8C97B] to-[#E5D9B6] bg-[length:200%_100%] animate-gradient"></div>

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>

            <div className="absolute inset-0 rounded-2xl border-2 border-white/20"></div>

            <div className="relative z-10 flex items-center justify-center gap-3 text-black font-black text-sm uppercase tracking-[0.15em]">
              <span>Chi Tiết</span>
              <FaArrowRight className="group-hover/btn:translate-x-2 transition-transform duration-300" />
            </div>
          </button>
        </div>

        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-[rgba(216,201,123,0.1)] to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      </div>
    </Link>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;
