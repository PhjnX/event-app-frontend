import React, { useEffect, useState } from "react";
import { Link } from "@/utils/i18n-router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  motion,
  AnimatePresence,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FaMapMarkerAlt,
  FaClock,
  FaCopy,
  FaCheck,
  FaQrcode,
  FaTicketAlt,
  FaCamera,
  FaHourglassHalf,
} from "react-icons/fa";
import type { AppDispatch, RootState } from "@/store";
import { fetchMyRegistrations } from "@/store/slices/eventSlice";
import LoadingScreen from "../_components/common/LoadingSrceen";

const formatDate = (dateString: string, locale: string) => {
  if (!dateString)
    return { day: "00", month: "DEC", time: "--:--", fullDate: "" };

  const date = new Date(dateString);
  const localeStr = locale === "vi" ? "vi-VN" : "en-US";

  return {
    day: date.getDate().toString().padStart(2, "0"),
    month: date.toLocaleString(localeStr, { month: "short" }).toUpperCase(),
    year: date.getFullYear(),
    time: date.toLocaleTimeString(localeStr, {
      hour: "2-digit",
      minute: "2-digit",
    }),
    fullDate: date.toLocaleDateString(localeStr, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
};

const LuxuryTicket = ({ ticket, index }: { ticket: any; index: number }) => {
  const { t, i18n } = useTranslation();
  const dateInfo = formatDate(ticket.eventStartDate, i18n.language);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const isExpired = new Date() > new Date(ticket.eventEndDate);
  const isApproved =
    ticket.status === "APPROVED" || ticket.status === "CONFIRMED";
  const isUsed = ticket.status === "CHECKED_IN";
  const canShowQR = (isApproved || isUsed) && !isExpired;
  const showGallery = isApproved || isUsed;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);
  const brightness = useTransform(mouseY, [-0.5, 0.5], [1.15, 0.9]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    x.set((e.clientX - rect.left - width / 2) / width);
    y.set((e.clientY - rect.top - height / 2) / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ticket.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderStatusLabel = () => {
    if (isExpired && ticket.status !== "REJECTED")
      return t("my_registrations.ticket.status.archived");

    const statusKey = ticket.status.toLowerCase();
    return t(`my_registrations.ticket.status.${statusKey}`, ticket.status);
  };

  const getStatusColor = () => {
    if (isExpired && ticket.status !== "REJECTED") return "bg-zinc-600";
    switch (ticket.status) {
      case "APPROVED":
      case "CONFIRMED":
        return "bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]";
      case "CHECKED_IN":
        return "bg-emerald-500 shadow-[0_0_10px_#10b981]";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-zinc-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="perspective-1000 w-full mb-8 group font-noto"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          filter: useMotionTemplate`brightness(${brightness})`,
        }}
        className="relative w-full h-auto min-h-[300px] md:h-[260px] rounded-3xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] transition-all duration-300 bg-[#0e0e0e] border border-white/5 hover:border-[#D4AF37]/30"
      >
        <div className="absolute inset-0 z-0 select-none">
          <img
            src={
              ticket.eventBanner ||
              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
            }
            alt="bg"
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-[0.35] ${
              isExpired ? "grayscale opacity-20" : ""
            }`}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black via-[#050505]/95 to-transparent" />
        </div>

        <div className="absolute inset-0 z-10 flex flex-col md:flex-row items-stretch">
          <div className="flex-1 p-6 md:p-7 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md flex items-center gap-2 border border-white/5 bg-white/5 text-zinc-300`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${getStatusColor()} ${
                      !isExpired && "animate-pulse"
                    }`}
                  ></div>
                  {renderStatusLabel()}
                </div>
                <div className="h-px w-8 bg-white/10" />
                <span className="text-[10px] font-mono text-white/30 tracking-wider">
                  ID: {ticket.registrationId}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-[1.1] tracking-tighter line-clamp-2 uppercase">
                {ticket.eventName}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-xs font-medium text-zinc-400">
              <div className="flex items-center gap-2">
                <FaClock className="text-[#D4AF37]" />
                <span>{dateInfo.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#D4AF37]" />
                <span className="truncate max-w-[200px]">
                  {ticket.location || t("my_registrations.ticket.location_tba")}
                </span>
              </div>
            </div>
          </div>

          <div className="relative w-full h-px md:w-px md:h-full bg-transparent flex items-center justify-center">
            <div className="w-full h-px md:w-px md:h-[80%] border-t md:border-l border-dashed border-white/10 group-hover:border-[#D4AF37]/30 transition-colors"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 md:top-0 md:left-1/2 md:-translate-x-1/2 w-4 h-4 bg-[#050505] rounded-full z-20 border-r md:border-b border-white/10" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 md:bottom-0 md:left-1/2 md:-translate-x-1/2 w-4 h-4 bg-[#050505] rounded-full z-20 border-l md:border-t border-white/10" />
          </div>

          <div className="w-full md:w-[220px] p-4 flex flex-col justify-center gap-4 bg-white/1 backdrop-blur-[2px]">
            <div className="flex flex-row md:flex-col items-center justify-between md:justify-center md:gap-1 text-center border-b md:border-b-0 border-white/5 pb-3 md:pb-0 mb-2 md:mb-0">
              <span className="md:hidden text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
                {t("my_registrations.ticket.date_label")}
              </span>

              <div>
                <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.4em] mb-1 md:block hidden">
                  {t("my_registrations.ticket.start_label")}
                </div>
                <div className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                  {dateInfo.day}
                </div>
                <div className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">
                  {dateInfo.month}
                </div>
                <div className="text-[9px] text-zinc-600 font-mono mt-1">
                  {dateInfo.year}
                </div>
              </div>

              <span className="md:hidden text-xs font-bold text-zinc-500">
                {dateInfo.time}
              </span>
            </div>

            <div className="space-y-2">
              <Link
                to={`/event/${ticket.eventSlug}`}
                className="w-full h-9 bg-white text-black hover:bg-[#D4AF37] transition-all rounded font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
              >
                {t("my_registrations.ticket.btn_view")}
              </Link>

              {canShowQR ? (
                <button
                  onClick={() => setShowQrModal(true)}
                  className="w-full h-9 border border-white/10 text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all rounded font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <FaQrcode /> {t("my_registrations.ticket.btn_code")}
                </button>
              ) : (
                !isExpired && (
                  <div className="w-full h-9 border border-dashed border-white/10 text-zinc-600 rounded font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                    <FaHourglassHalf />{" "}
                    {t("my_registrations.ticket.btn_pending")}
                  </div>
                )
              )}

              {showGallery && (
                <Link
                  to={`/event/${ticket.eventSlug}/moments`}
                  className="block w-full text-center mt-1"
                >
                  <span className="text-[9px] text-zinc-500 hover:text-white border-b border-transparent hover:border-white transition-colors uppercase tracking-widest flex items-center justify-center gap-1">
                    <FaCamera size={10} />{" "}
                    {t("my_registrations.ticket.btn_gallery")}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 duration-1000 transition-opacity z-20"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(212, 175, 55, 0.05) 45%, rgba(212, 175, 55, 0.08) 50%, transparent 54%)",
          }}
        />
      </motion.div>

      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              layoutId={`qr-${ticket.registrationId}`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative z-10 bg-black border border-white/10 p-6 rounded-3xl max-w-[320px] w-full text-center shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#D4AF37]" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#D4AF37]" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#D4AF37]" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#D4AF37]" />

              <div className="py-4">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-tight mb-1">
                  {ticket.eventName}
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  {dateInfo.fullDate}
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl mx-auto mb-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] w-fit relative overflow-hidden">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticket.ticketCode}&bgcolor=ffffff&color=000000&format=svg`}
                  className="w-40 h-40 object-contain"
                  alt="QR"
                />
                <div className="absolute left-0 top-0 w-full h-1 bg-[#D4AF37] opacity-80 shadow-[0_0_15px_#D4AF37] animate-[scan_3s_infinite_ease-in-out]"></div>
              </div>

              <div
                onClick={handleCopy}
                className="bg-[#111] border border-dashed border-zinc-800 rounded px-4 py-3 flex items-center justify-between cursor-pointer hover:border-[#D4AF37] transition-colors mb-4 group/copy"
              >
                <span className="text-[10px] text-zinc-500 uppercase font-bold">
                  {t("my_registrations.modal.code_label")}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#D4AF37] font-bold text-sm tracking-widest">
                    {ticket.ticketCode}
                  </span>
                  {copied ? (
                    <FaCheck size={10} className="text-emerald-500" />
                  ) : (
                    <FaCopy
                      size={10}
                      className="text-zinc-600 group-hover/copy:text-white"
                    />
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-widest"
              >
                {t("my_registrations.modal.close")}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function MyRegistrationsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { myRegistrations, isLoading } = useSelector(
    (state: RootState) => state.events,
  );
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "PAST">("UPCOMING");

  useEffect(() => {
    dispatch(fetchMyRegistrations());
  }, [dispatch]);

  const filteredList = (myRegistrations || []).filter((t: any) => {
    const endDate = new Date(t.eventEndDate);
    return activeTab === "UPCOMING"
      ? endDate >= new Date()
      : endDate < new Date();
  });

  const status = {
    active: (myRegistrations || []).filter(
      (t: any) =>
        new Date(t.eventEndDate) >= new Date() &&
        (t.status === "APPROVED" || t.status === "CONFIRMED"),
    ).length,
    total: (myRegistrations || []).length,
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-noto">
      <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] z-0" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-24">
        <header className="mb-20">
          <div className="relative w-full border-b border-white/10 pb-8 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]">
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#050505]" />

            <div className="relative z-10 flex flex-col md:flex-row items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
                  </span>
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.3em] font-noto">
                    {t("my_registrations.title.access_badge")}
                  </span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-white ">
                  {t("my_registrations.title.main_wallet")}
                  <br />
                  <span className="inline-block pt-2 pb-2  text-transparent bg-clip-text bg-linear-to-r from-[#D4AF37] to-[#F2C94C] opacity-90">
                    {t("my_registrations.title.main_ticket")}
                  </span>
                </h1>
              </div>

              <div className="flex gap-8 items-center border-l border-white/10 pl-8 h-24 backdrop-blur-sm">
                <div className="hidden md:block">
                  {/* Số Active màu trắng sáng */}
                  <div className="text-4xl md:text-5xl font-black text-white text-right tracking-tighter leading-none">
                    {status.active}
                  </div>
                  <div className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest text-right mt-1">
                    {t("my_registrations.stats.active_passes")}
                  </div>
                </div>

                <div className="hidden md:block w-px h-10 bg-linear-to-b from-transparent via-white/20 to-transparent"></div>

                <div>
                  <div className="text-4xl md:text-5xl font-black text-zinc-600 text-right tracking-tighter leading-none">
                    {status.total}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-right mt-1">
                    {t("my_registrations.stats.total_history")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-start pt-6">
            <div className="inline-flex relative gap-6">
              {["UPCOMING", "PAST"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`relative pb-2 mr-2 text-xs font-black uppercase tracking-[0.2em] transition-all group ${
                    activeTab === tab
                      ? "text-white"
                      : "text-zinc-600 hover:text-[#D4AF37]"
                  }`}
                >
                  <span className="relative z-10">
                    {tab === "UPCOMING"
                      ? t("my_registrations.tabs.upcoming")
                      : t("my_registrations.tabs.past")}
                  </span>

                  {activeTab === tab && (
                    <motion.div
                      layoutId="tabLine"
                      className="absolute bottom-0 left-0 w-full h-[3px] bg-[#D4AF37] shadow-[0_0_15px_#D4AF37]"
                    />
                  )}
                  {activeTab !== tab && (
                    <div className="absolute bottom-0 left-0 w-0 h-px bg-white/20 transition-all duration-300 group-hover:w-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingScreen />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {filteredList.length > 0 ? (
                filteredList.map((ticket: any, idx: number) => (
                  <LuxuryTicket
                    key={ticket.registrationId}
                    ticket={ticket}
                    index={idx}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#0a0a0a]"
                >
                  <FaTicketAlt className="text-4xl text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-zinc-400 font-bold uppercase tracking-widest text-sm">
                    {t("my_registrations.empty.title")}
                  </h3>
                  {activeTab === "UPCOMING" && (
                    <Link
                      to="/events"
                      className="mt-4 inline-block text-[10px] font-black uppercase text-[#D4AF37] border-b border-[#D4AF37]"
                    >
                      {t("my_registrations.empty.btn_find")}
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style>{`
          @keyframes scan { 0%, 100% { top: 0% } 50% { top: 100% } }
       `}</style>
    </div>
  );
}
