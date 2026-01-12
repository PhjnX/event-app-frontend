import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaClock,
  FaTicketAlt,
  FaCalendarAlt,
  FaHistory,
  FaArrowRight,
  FaCopy,
  FaCheck,
  FaHourglassStart,
  FaTimesCircle,
  FaBan,
  FaCamera,
} from "react-icons/fa";
import type { AppDispatch, RootState } from "@/store";
import { fetchMyRegistrations } from "@/store/slices/eventSlice";
import LoadingScreen from "../_components/common/LoadingSrceen";
const formatDate = (dateString: string) => {
  if (!dateString)
    return { day: "00", month: "DEC", full: "TBA", time: "--:--" };
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    year: date.getFullYear(),
    time: date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    weekday: date.toLocaleDateString("vi-VN", { weekday: "long" }),
  };
};

const StatusIndicator = ({
  status,
  isExpired,
}: {
  status: string;
  isExpired: boolean;
}) => {
  if (isExpired && status !== "REJECTED") {
    return (
      <div className="flex items-center gap-2 text-zinc-500 border border-zinc-700 bg-zinc-800/50 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
        <FaBan size={10} /> Event Ended
      </div>
    );
  }
  const map: any = {
    APPROVED: {
      color: "text-[#B5A65F]",
      bg: "bg-[#B5A65F]/10",
      border: "border-[#B5A65F]/30",
      icon: (
        <span className="w-1.5 h-1.5 rounded-full bg-[#B5A65F] animate-pulse" />
      ),
      label: "Valid Ticket",
    },
    CHECKED_IN: {
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      icon: <FaCheck size={10} />,
      label: "Checked In",
    },
    PENDING: {
      color: "text-orange-400",
      bg: "bg-orange-500/5",
      border: "border-orange-500/20",
      icon: <FaHourglassStart size={10} />,
      label: "Processing",
    },
    REJECTED: {
      color: "text-red-500",
      bg: "bg-red-500/5",
      border: "border-red-500/20",
      icon: <FaTimesCircle size={10} />,
      label: "Cancelled",
    },
  };
  const s = map[status] || map.REJECTED;
  return (
    <div
      className={`flex items-center gap-2 ${s.color} ${s.bg} border ${s.border} px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm`}
    >
      {s.icon} {s.label}
    </div>
  );
};

const TicketCard = ({ ticket, index }: { ticket: any; index: number }) => {
  const dateInfo = formatDate(ticket.eventStartDate);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  const now = new Date();
  const eventEndDate = new Date(ticket.eventEndDate);
  const isExpired = now > eventEndDate;
  const isApproved = ticket.status === "APPROVED";
  const isUsed = ticket.status === "CHECKED_IN";
  const showQR = (isApproved || isUsed) && !isExpired;

  // Lấy Slug
  const targetSlug = ticket.eventSlug;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.ticketCode}&bgcolor=ffffff`;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(ticket.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`group relative w-full flex flex-col md:flex-row bg-[#0a0a0a] rounded-2xl overflow-hidden border transition-all duration-500 shadow-2xl ${
        isExpired
          ? "border-zinc-800 opacity-80 grayscale-[0.8]"
          : "border-[#B5A65F]/20 hover:border-[#B5A65F]/50 hover:shadow-[0_10px_40px_-10px_rgba(181,166,95,0.15)]"
      }`}
    >
      {!isExpired && (
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#B5A65F]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-0" />
      )}

      <Link
        to={`/event/${ticket.eventSlug}`}
        className="relative w-full md:w-[300px] h-64 md:h-auto shrink-0 overflow-hidden block"
      >
        <img
          src={
            imgError || !ticket.eventBanner
              ? "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop"
              : ticket.eventBanner
          }
          alt={ticket.eventName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImgError(true)}
        />
        <div
          className={`absolute top-4 left-4 z-20 backdrop-blur-md border p-3 rounded-lg flex flex-col items-center min-w-[70px] shadow-lg ${
            isExpired
              ? "bg-zinc-900/80 border-zinc-700"
              : "bg-[#0a0a0a]/80 border-[#B5A65F]/30"
          }`}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              isExpired ? "text-zinc-500" : "text-[#B5A65F]"
            }`}
          >
            {dateInfo.month}
          </span>
          <span className="text-3xl font-black text-white leading-none font-noto">
            {dateInfo.day}
          </span>
        </div>
      </Link>

      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative z-10">
        <div>
          <div className="flex justify-between items-start mb-4">
            <StatusIndicator status={ticket.status} isExpired={isExpired} />
            <span className="text-[10px] font-mono text-zinc-600 tracking-widest">
              #{ticket.registrationId?.toString().padStart(6, "0")}
            </span>
          </div>
          <Link to={`/event/${ticket.eventSlug}`}>
            <h2
              className={`text-2xl md:text-3xl font-bold mb-2 leading-tight transition-colors duration-300 font-noto ${
                isExpired
                  ? "text-zinc-400"
                  : "text-white group-hover:text-[#B5A65F]"
              }`}
            >
              {ticket.eventName}
            </h2>
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-start gap-3">
              <FaClock
                className={`mt-1 shrink-0 ${
                  isExpired ? "text-zinc-600" : "text-[#B5A65F]"
                }`}
              />
              <div>
                <p
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    isExpired ? "text-zinc-600" : "text-[#B5A65F]/70"
                  }`}
                >
                  Time
                </p>
                <p className="text-sm text-zinc-300 font-noto">
                  {dateInfo.time} - {dateInfo.weekday}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt
                className={`mt-1 shrink-0 ${
                  isExpired ? "text-zinc-600" : "text-[#B5A65F]"
                }`}
              />
              <div>
                <p
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    isExpired ? "text-zinc-600" : "text-[#B5A65F]/70"
                  }`}
                >
                  Location
                </p>
                <p className="text-sm text-zinc-300 font-noto line-clamp-1">
                  {ticket.location || "TBA"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            to={`/event/${ticket.eventSlug}`}
            className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${
              isExpired
                ? "text-zinc-500 hover:text-zinc-300"
                : "text-[#B5A65F] hover:gap-4"
            }`}
          >
            View Details <FaArrowRight />
          </Link>

          {/* LINK SANG TRANG MOMENT (Dùng Slug) */}
          {(isApproved || isUsed) && (
            <Link
              to={`/event/${targetSlug}/moments`}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                isExpired
                  ? "bg-zinc-800 border-zinc-700 text-zinc-400"
                  : "bg-[#B5A65F]/10 border-[#B5A65F]/20 text-white hover:bg-[#B5A65F] hover:text-black"
              }`}
            >
              <FaCamera className={isExpired ? "" : "animate-pulse"} />{" "}
              {isExpired ? "Gallery" : "Moments"}
            </Link>
          )}
        </div>
      </div>

      <div className="relative w-full md:w-60 bg-[#050505] p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-dashed border-[#B5A65F]/20 shrink-0">
        {showQR ? (
          <div className="w-full flex flex-col items-center">
            <div className="relative p-1 rounded-xl bg-linear-to-br from-[#B5A65F] to-[#7a6f3b] shadow-lg mb-5 group-hover:scale-105 transition-transform duration-300">
              <div className="bg-white p-2 rounded-lg relative overflow-hidden">
                <img
                  src={qrCodeUrl}
                  alt="QR"
                  className={`w-32 h-32 object-contain mix-blend-multiply ${
                    isUsed ? "opacity-30 blur-[1px]" : ""
                  }`}
                />
                {isUsed && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="border-4 border-cyan-500 text-cyan-500 px-2 py-1 text-2xl font-black uppercase -rotate-12 opacity-80 tracking-widest">
                      USED
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-2">
              Access Code
            </p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#B5A65F]/10 border border-[#B5A65F]/20 hover:border-[#B5A65F] transition-colors group/code"
            >
              <span className="font-mono text-sm font-bold text-[#B5A65F] tracking-widest">
                {ticket.ticketCode?.substring(0, 8)}...
              </span>
              {copied ? (
                <FaCheck className="text-green-400 text-xs" />
              ) : (
                <FaCopy className="text-[#B5A65F]/50 group-hover/code:text-[#B5A65F] text-xs" />
              )}
            </button>
          </div>
        ) : (
          <div className="opacity-40 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              {isExpired ? (
                <FaHistory size={30} className="text-zinc-600" />
              ) : (
                <FaTicketAlt size={30} className="text-zinc-600" />
              )}
            </div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
              {isExpired
                ? "Event Ended"
                : ticket.status === "PENDING"
                ? "Processing..."
                : "Unavailable"}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function MyRegistrationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { myRegistrations, isLoading } = useSelector(
    (state: RootState) => state.events
  );
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "PAST">("UPCOMING");

  useEffect(() => {
    dispatch(fetchMyRegistrations());
  }, [dispatch]);

  const now = new Date();
  const filteredList = (myRegistrations || []).filter((t: any) => {
    const endDate = new Date(t.eventEndDate);
    if (activeTab === "UPCOMING") return endDate >= now;
    return endDate < now;
  });

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-4 md:px-8 font-noto relative selection:bg-[#B5A65F] selection:text-black">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#B5A65F]/10 rounded-full blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8"
          >
            My{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-b from-[#B5A65F] to-[#8a7d45]">
              Tickets
            </span>
          </motion.h1>
          <div className="inline-flex p-1 bg-[#111] border border-white/10 rounded-xl">
            {[
              { id: "UPCOMING", label: "Upcoming" },
              { id: "PAST", label: "History" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                  activeTab === tab.id
                    ? "text-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="gold-tab"
                    className="absolute inset-0 bg-[#B5A65F] rounded-lg shadow-[0_0_20px_rgba(181,166,95,0.4)]"
                  />
                )}{" "}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.id === "UPCOMING" ? <FaCalendarAlt /> : <FaHistory />}{" "}
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingScreen />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredList.length > 0 ? (
                <div className="flex flex-col gap-8">
                  {filteredList.map((ticket: any, idx: number) => (
                    <TicketCard
                      key={ticket.registrationId}
                      ticket={ticket}
                      index={idx}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-32 border border-dashed border-zinc-800 rounded-[40px] bg-zinc-900/30"
                >
                  <FaHistory className="text-6xl text-zinc-700 mb-6" />
                  <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-widest">
                    {activeTab === "UPCOMING"
                      ? "No Upcoming Events"
                      : "No History Found"}
                  </h3>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
