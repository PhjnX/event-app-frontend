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
  if (!dateString) return { day: "--", month: "TH-", time: "--:--" };
  const date = new Date(
    dateString.endsWith("Z") ? dateString : `${dateString}Z`,
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

const EventCard = memo(function EventCard({
  event,
  className = "",
}: {
  event: Event;
  className?: string;
}) {
  const dateInfo = formatDate(event.startDate);
  const statusLabel = (event.status || "PUBLISHED").toUpperCase();

  return (
    <Link
      to={`/event/${event.slug || event.eventId}`}
      className={`block h-full ${className}`}
    >
      <div className="group relative h-full bg-linear-to-br from-[#161616] via-[#141414] to-[#0f0f0f] rounded-3xl overflow-hidden border border-[rgba(216,201,123,0.2)] hover:border-[rgba(216,201,123,0.5)] transition-all duration-400 shadow-[0_10px_30px_rgba(0,0,0,0.55)] hover:shadow-[0_14px_38px_rgba(216,201,123,0.22)] hover:-translate-y-2 hover:scale-[1.01] will-change-transform">
        <div className="absolute inset-0 bg-linear-to-br from-[rgba(216,201,123,0.06)] via-transparent to-[rgba(216,201,123,0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>

        <div className="relative h-52 overflow-hidden">
          <OptimizedImage
            src={event.bannerImageUrl}
            alt={event.eventName}
            width={420}
            height={208}
            className="w-full h-full"
            imgClassName="w-full h-full object-cover brightness-95 transition-transform duration-600 ease-out group-hover:scale-[1.07] group-hover:rotate-[0.6deg] group-hover:brightness-100"
            fallback="https://via.placeholder.com/600x400?text=Event+Image"
          />

          <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f] via-[rgba(15,15,15,0.55)] to-transparent"></div>
          <div className="absolute inset-0 bg-linear-to-br from-[rgba(216,201,123,0.12)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>

          <div className="absolute top-4 right-4 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-[#E5D9B6] to-[#D8C97B] rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <div className="relative bg-linear-to-br from-[#E5D9B6] via-[#D8C97B] to-[#C9BA6A] rounded-2xl p-3.5 shadow-[0_6px_18px_rgba(216,201,123,0.45)] min-w-[68px] text-center transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-400">
                <span className="relative block text-3xl font-black text-black leading-none drop-shadow-md">
                  {dateInfo.day}
                </span>
                <span className="relative block text-[10px] text-black/80 font-bold uppercase tracking-widest mt-1">
                  {dateInfo.month}
                </span>
              </div>
            </div>
          </div>

          <div className="absolute top-4 left-4 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D8C97B] rounded-xl blur-md opacity-55"></div>
              <span className="relative inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.14em] bg-linear-to-r from-[#E5D9B6] to-[#D8C97B] text-black shadow-md">
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="relative p-6 flex flex-col">
          <div className="inline-flex items-center gap-2.5 self-start mb-4 px-4 py-2 rounded-full bg-linear-to-r from-[rgba(216,201,123,0.18)] via-[rgba(216,201,123,0.12)] to-transparent border border-[rgba(216,201,123,0.28)] backdrop-blur-sm group-hover:border-[rgba(216,201,123,0.45)] transition-all duration-300">
            <div className="w-6 h-6 rounded-full bg-linear-to-br from-[#E5D9B6] to-[#D8C97B] flex items-center justify-center shadow-sm">
              <FaUserTie className="text-black text-[10px]" />
            </div>
            <span className="text-[#D8C97B] text-xs uppercase font-black tracking-wider truncate max-w-[180px]">
              {event.organizerName || "TIT EVENT"}
            </span>
          </div>

          <h3 className="text-xl font-black text-white mb-4 line-clamp-2 leading-snug min-h-14 group-hover:text-[#F4E2A6] transition-colors duration-300">
            {event.eventName}
          </h3>

          <div className="space-y-3 mb-5 text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-linear-to-br from-[rgba(216,201,123,0.2)] to-[rgba(216,201,123,0.05)] border border-[rgba(216,201,123,0.25)] shadow-inner">
                <FaClock className="text-[#D8C97B] text-xs" />
              </div>
              <span className="font-semibold">{dateInfo.time}</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-linear-to-br from-[rgba(216,201,123,0.2)] to-[rgba(216,201,123,0.05)] border border-[rgba(216,201,123,0.25)] shadow-inner shrink-0">
                <FaMapMarkerAlt className="text-[#D8C97B] text-xs" />
              </div>
              <span className="text-sm font-medium text-gray-300 line-clamp-2 leading-relaxed">
                {event.location || "Online"}
              </span>
            </div>
          </div>

          <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed grow">
            {event.description ||
              "Khám phá sự kiện đặc sắc với nhiều hoạt động thú vị và bổ ích."}
          </p>

          <button className="relative w-full py-4 rounded-2xl overflow-hidden group/btn transition-all duration-300 shadow-[0_4px_18px_rgba(216,201,123,0.25)] hover:shadow-[0_6px_26px_rgba(216,201,123,0.42)]">
            <div className="absolute inset-0 bg-linear-to-r from-[#E5D9B6] via-[#D8C97B] to-[#E5D9B6] bg-size-[200%_100%] animate-gradient"></div>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-900"></div>
            <div className="absolute inset-0 rounded-2xl border border-white/15"></div>
            <div className="relative z-10 flex items-center justify-center gap-3 text-black font-black text-sm uppercase tracking-[0.15em]">
              <span>Chi Tiết</span>
              <FaArrowRight className="transition-transform duration-300 group-hover/btn:translate-x-2" />
            </div>
          </button>
        </div>

        <div className="absolute bottom-0 right-0 w-20 h-20 bg-linear-to-tl from-[rgba(216,201,123,0.12)] to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
      </div>
    </Link>
  );
});

export default EventCard;
