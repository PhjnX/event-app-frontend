import { Link } from "react-router-dom";
import { memo } from "react";
import { FaMapMarkerAlt, FaArrowRight, FaClock } from "react-icons/fa";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useTranslation } from "react-i18next";

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
  if (!dateString)
    return { day: "--", month: "TH--", time: "--:--", fullDate: "--/--/----" };
  const date = new Date(
    dateString.endsWith("Z") ? dateString : `${dateString}Z`,
  );
  return {
    day: date.getDate(),
    month: `Thg ${date.getMonth() + 1}`,
    time: date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    fullDate: date.toLocaleDateString("vi-VN"),
  };
};

const EventCard = memo(function EventCard({
  event,
  className = "",
}: {
  event: Event;
  className?: string;
}) {
  const { t } = useTranslation();
  const dateInfo = formatDate(event.startDate);

  return (
    <Link
      to={`/event/${event.slug || event.eventId}`}
      className={`block h-full group ${className}`}
    >
      <div className="relative h-full flex flex-col bg-[#111111] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#D8C97B]/50 hover:shadow-[0_0_30px_-10px_rgba(216,201,123,0.15)] hover:-translate-y-1">
        <div className="relative h-48 sm:h-52 overflow-hidden">
          <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 flex flex-col items-center min-w-[50px]">
            <span className="text-xl font-bold text-white leading-none">
              {dateInfo.day}
            </span>
            <span className="text-[10px] font-medium text-[#D8C97B] uppercase mt-0.5">
              {dateInfo.month}
            </span>
          </div>

          <OptimizedImage
            src={event.bannerImageUrl}
            alt={event.eventName}
            width={400}
            height={250}
            className="w-full h-full"
            imgClassName="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
            fallback="https://via.placeholder.com/600x400?text=Event"
          />

          <div className="absolute inset-0 bg-linear-to-t from-[#111111] via-transparent to-transparent opacity-90" />
        </div>

        <div className="flex flex-col grow p-5 pt-2">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-px w-4 bg-[#D8C97B]"></span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#D8C97B]/90 truncate">
              {event.organizerName ||
                t("home.events_section.card.organizer_default")}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-normal overflow-hidden group-hover:text-[#D8C97B] transition-colors duration-300 min-h-[3.375rem]">
            {event.eventName}
          </h3>

          <div className="space-y-2.5 mb-5">
            <div className="flex items-center gap-2.5 text-gray-400 text-xs">
              <FaClock className="text-[#D8C97B]" />
              <span>
                {dateInfo.time} - {dateInfo.fullDate}
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-gray-400 text-xs">
              <FaMapMarkerAlt className="text-[#D8C97B] mt-0.5 shrink-0" />
              <span className="line-clamp-1">
                {event.location ||
                  t("home.events_section.card.location_default")}
              </span>
            </div>
          </div>

          <div className="grow" />

          <div className="relative pt-4 border-t border-white/5 flex items-center justify-between group/btn">
            <span className="text-xs font-medium text-gray-500 group-hover:text-white transition-colors">
              {t("home.events_section.card.details")}
            </span>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#D8C97B] group-hover:border-[#D8C97B] transition-all duration-300">
              <FaArrowRight className="text-xs text-gray-400 group-hover:text-black transition-colors -rotate-45 group-hover:rotate-0" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default EventCard;
