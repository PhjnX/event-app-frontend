import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaRegCircle,
  FaTicketAlt,
  FaClock,
  FaUsers,
  FaBan,
  FaMapMarkerAlt,
  FaInfinity,
  FaGlobe,
} from "react-icons/fa";
import { toast } from "react-toastify";

import apiService from "@/services/apiService";
import {
  registerForEvent,
  addActivitiesToEvent,
} from "@/store/slices/eventSlice";
import type { AppDispatch, RootState } from "@/store";
import LoadingScreen from "../_components/common/LoadingSrceen";
import type { Event } from "@/models/event";
import type { Activity } from "@/models/activity";
import type { Presenter } from "@/models/presenter";
import OptimizedImage from "@/components/ui/OptimizedImage";

export default function PublicEventDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [event, setEvent] = useState<Event | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [presenters, setPresenters] = useState<Presenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([]);
  const [registeredActivityIds, setRegisteredActivityIds] = useState<number[]>(
    [],
  );

  const [shakeId, setShakeId] = useState<number | null>(null);

  const { scrollYProgress } = useScroll();
  const scaleImage = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);

  const hasJoinedEvent = registeredActivityIds.length > 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventRes = await apiService.get<Event>(`/events/${slug}`);
        setEvent(eventRes);

        if (eventRes.eventId) {
          const actRes = await apiService.get<Activity[]>(
            `/activities/by-event/${eventRes.eventId}`,
          );

          const sortedActs = actRes.sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
          );
          setActivities(sortedActs);

          if (user) {
            try {
              const myRegisteredActs = await apiService.get<Activity[]>(
                `/activities/by-event/${eventRes.eventId}/registered`,
              );
              const myRegisteredIds = myRegisteredActs.map((a) => a.activityId);
              setRegisteredActivityIds(myRegisteredIds);
            } catch (err) {
              console.log("User chưa tham gia sự kiện này.");
            }
          }

          const uniquePresenters = Array.from(
            new Map(
              actRes
                .filter((a) => a.presenter)
                .map((a) => [a.presenter.presenterId, a.presenter]),
            ).values(),
          );
          setPresenters(uniquePresenters);
        }
      } catch (error) {
        toast.error("Không tìm thấy sự kiện");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug, user]);

  const formatTime = (isoTime: string) => {
    return isoTime.split("T")[1].substring(0, 5);
  };

  const checkIsFull = (act: any) => {
    if (!act.maxAttendees || act.maxAttendees === 0) return false;

    return (act.currentAttendees || 0) >= act.maxAttendees;
  };

  const toggleActivity = (activityId: number, isFull: boolean) => {
    if (registeredActivityIds.includes(activityId)) return;

    if (isFull) {
      setShakeId(activityId);
      setTimeout(() => setShakeId(null), 500); 
      toast.error("Hoạt động này đã hết chỗ!");
      return;
    }

    setSelectedActivityIds((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId],
    );
  };

  const handleRegister = async () => {
    if (!user) return toast.warn("Vui lòng đăng nhập để đăng ký!");
    if (!event || selectedActivityIds.length === 0)
      return toast.warn("Bạn chưa chọn hoạt động nào!");

    setIsRegistering(true);
    try {
      if (hasJoinedEvent) {
        await dispatch(
          addActivitiesToEvent({
            eventId: event.eventId,
            activityIds: selectedActivityIds,
          }),
        ).unwrap();
        toast.success("🎉 Đã bổ sung hoạt động thành công!");
      } else {
        await dispatch(
          registerForEvent({
            eventId: event.eventId,
            activityIds: selectedActivityIds,
          }),
        ).unwrap();
        toast.success("🎉 Đăng ký sự kiện thành công!");
      }

      setRegisteredActivityIds((prev) => [...prev, ...selectedActivityIds]);
      setSelectedActivityIds([]);
    } catch (error: any) {
      toast.error(error || "Thao tác thất bại.");
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!event)
    return (
      <div className="text-white text-center pt-32 h-screen bg-[#050505]">
        Sự kiện không tồn tại.
      </div>
    );

  return (
    <div className="bg-[#050505] min-h-screen font-noto text-gray-200 selection:bg-[#B5A65F]/30 pb-32">
      <nav className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            to="/events"
            className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-[#B5A65F] transition-all"
          >
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#B5A65F] transition-all">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span>Quay lại</span>
          </Link>
          <div className="hidden md:block text-[10px] text-gray-500 font-black tracking-[0.3em] uppercase">
            {event.eventName}
          </div>
        </div>
      </nav>

      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white max-w-4xl mb-8">
              {event.eventName}
            </h1>
            <div className="flex flex-wrap gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <FaClock className="text-[#B5A65F]" />
                <span className="text-white">
                  {new Date(event.startDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#B5A65F]" />
                <span className="text-white">{event.location}</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            style={{ scale: scaleImage }}
            className="mt-12 relative h-[300px] md:h-[500px] rounded-4xl overflow-hidden border border-white/10"
          >
            <OptimizedImage
              src={event.bannerImageUrl}
              alt={event.eventName}
              width={1200}
              height={500}
              priority={true}
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-transparent to-transparent opacity-80" />
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6 max-w-7xl mb-20">
        <p className="text-lg md:text-xl font-light leading-relaxed text-gray-300 border-l-4 border-[#B5A65F] pl-6">
          {event.description}
        </p>
      </section>

      <main className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="w-full lg:w-3/5 space-y-12">
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-3xl font-black uppercase tracking-tight text-white">
                  Lịch trình Sự kiện
                </h3>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              <div className="flex flex-col gap-6">
                {activities.map((act: any) => {
                  const isSelected = selectedActivityIds.includes(
                    act.activityId,
                  );
                  const isRegistered = registeredActivityIds.includes(
                    act.activityId,
                  );

                  const isFull = checkIsFull(act);

                  const isUnlimited =
                    !act.maxAttendees || act.maxAttendees === 0;

                  const isShaking = shakeId === act.activityId;

                  let wrapperClass =
                    "border-white/5 bg-[#121212] hover:bg-[#181818] cursor-pointer";
                  let timeClass = "text-gray-400 border-white/10";
                  let titleClass = "text-white";
                  let iconStatus = (
                    <FaRegCircle className="text-gray-600 text-2xl group-hover:text-[#B5A65F] transition-colors" />
                  );

                  if (isRegistered) {
                    wrapperClass =
                      "border-green-900/30 bg-[#0a100a] opacity-60 cursor-default";
                    timeClass = "text-gray-500 border-green-900/20";
                    titleClass = "text-gray-500";
                    iconStatus = (
                      <FaCheckCircle className="text-green-800 text-2xl" />
                    );
                  } else if (isFull) {
                    wrapperClass = `
                        border-red-900/20 bg-[#140505] opacity-80 cursor-not-allowed
                        bg-[repeating-linear-gradient(45deg,#140505,#140505_10px,#1f0a0a_10px,#1f0a0a_20px)]
                    `;
                    timeClass = "text-red-900/40 border-red-900/10";
                    titleClass = "text-gray-500 opacity-50";
                    iconStatus = <FaBan className="text-red-900/40 text-2xl" />;
                  } else if (isSelected) {
                    wrapperClass =
                      "border-[#B5A65F] bg-[#1a1a1a] shadow-[0_0_25px_rgba(181,166,95,0.15)] z-10 scale-[1.02]";
                    timeClass = "text-[#B5A65F] font-bold border-[#B5A65F]/30";
                    titleClass = "text-[#B5A65F]";
                    iconStatus = (
                      <FaCheckCircle className="text-[#B5A65F] text-3xl drop-shadow-lg" />
                    );
                  }

                  return (
                    <motion.div
                      key={act.activityId}
                      layout
                      onClick={() => toggleActivity(act.activityId, isFull)}
                      animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      className={`
                        group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border transition-all duration-200
                        ${wrapperClass}
                      `}
                    >
                      {isFull && !isRegistered && (
                        <motion.div
                          initial={{ scale: 2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 10,
                          }}
                          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                        >
                          <div className="border-4 border-red-800/80 text-red-700 font-black text-4xl uppercase px-6 py-2 -rotate-12 tracking-[0.2em] backdrop-blur-[2px] bg-black/40 shadow-2xl">
                            HẾT CHỖ
                          </div>
                        </motion.div>
                      )}

                      {act.activityImageUrl && (
                        <div className="relative w-full sm:w-32 h-32 sm:h-auto shrink-0 overflow-hidden border-b sm:border-b-0 sm:border-r border-white/5">
                          <OptimizedImage
                            src={act.activityImageUrl}
                            alt={act.activityName}
                            width={128}
                            height={128}
                            className="w-full h-full"
                            imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                      )}

                      <div
                        className={`flex flex-row sm:flex-col items-center sm:justify-center gap-2 p-6 sm:w-28 sm:border-r border-dashed shrink-0 ${timeClass}`}
                      >
                        <div className="text-xl font-black tracking-tighter">
                          {formatTime(act.startTime)}
                        </div>
                        <div className="h-0.5 w-4 bg-current opacity-30 hidden sm:block"></div>
                        <div className="text-sm font-medium opacity-80">
                          {formatTime(act.endTime)}
                        </div>
                      </div>

                      <div className="flex-1 p-6 flex flex-col justify-center gap-3 relative z-10">
                        <div className="flex justify-between items-start gap-4">
                          <h4
                            className={`text-lg font-bold uppercase leading-tight ${titleClass}`}
                          >
                            {act.activityName}
                          </h4>

                          {!isRegistered && !isFull && (
                            <div
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-mono tracking-wide border ${
                                isSelected
                                  ? "bg-[#B5A65F]/10 text-[#B5A65F] border-[#B5A65F]/20"
                                  : "bg-white/5 text-gray-500 border-white/5"
                              }`}
                            >
                              {isUnlimited ? (
                                <span
                                  className="flex items-center gap-1"
                                  title="Không giới hạn"
                                >
                                  <FaInfinity />
                                  <span className="hidden sm:inline">
                                    Không giới hạn
                                  </span>
                                </span>
                              ) : (
                                <>
                                  <FaUsers size={10} />
                                  <span>
                                    {act.currentAttendees || 0}/
                                    {act.maxAttendees}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        {act.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 opacity-80">
                            {act.description}
                          </p>
                        )}
                        {act.presenter && (
                          <div className="flex items-center gap-3 mt-1 opacity-60">
                            <OptimizedImage
                              src={act.presenter.avatarUrl}
                              alt={act.presenter.fullName}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-[10px] uppercase font-bold text-gray-400">
                              {act.presenter.fullName}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center px-8 min-w-20 relative z-10">
                        {iconStatus}
                      </div>

                      {isRegistered && (
                        <div className="absolute top-0 right-0 bg-green-900/90 text-green-300 text-[9px] font-bold px-4 py-1.5 rounded-bl-xl border-l border-b border-green-500/30 z-20">
                          ĐÃ ĐĂNG KÝ
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-8 pt-8 border-t border-white/10">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  Khách mời
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {presenters.map((p) => (
                  <div
                    key={p.presenterId}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5 hover:border-[#B5A65F]/50 transition-all"
                  >
                    <OptimizedImage
                      src={p.avatarUrl}
                      alt={p.fullName}
                      width={200}
                      height={200}
                      className="w-full h-full"
                      imgClassName="opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black via-black/80 to-transparent">
                      <p className="text-sm font-bold text-white truncate">
                        {p.fullName}
                      </p>
                      <p className="text-[10px] text-[#B5A65F] uppercase tracking-wider">
                        {p.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="hidden lg:block lg:w-2/5 relative">
            <div className="sticky top-28">
              <div className="bg-white rounded-4xl overflow-hidden shadow-2xl relative text-black transform transition-all hover:scale-[1.01] duration-500">
                <div className="p-10 pb-12 relative">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white text-xl">
                      <FaTicketAlt />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">
                        Vé tham dự
                      </div>
                      <div className="text-base font-black font-mono tracking-tighter">
                        #EVN-{event.eventId}
                      </div>
                    </div>
                  </div>

                  <h2 className="text-3xl font-noto font-bold leading-[1.1] mb-8 tracking-tight">
                    {event.eventName}
                  </h2>

                  <div className="space-y-4 border-t-2 border-black/5 pt-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 uppercase font-bold tracking-wider text-[10px]">
                        Số lượng session đã chọn
                      </span>
                      <span className="font-black text-xl">
                        {selectedActivityIds.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 uppercase font-bold tracking-wider text-[10px]">
                        Hạng vé
                      </span>
                      <span className="font-bold text-[#B5A65F] uppercase tracking-wider text-xs">
                        {hasJoinedEvent ? "Premium Member" : "Standard"}
                      </span>
                    </div>
                    {hasJoinedEvent && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 uppercase font-bold tracking-wider text-[10px]">
                          Đã sở hữu
                        </span>
                        <span className="font-bold text-green-600 flex items-center gap-1.5 text-xs">
                          <FaCheckCircle /> {registeredActivityIds.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative w-full h-6 flex items-center justify-center">
                  <div className="absolute -left-4 w-8 h-8 bg-[#050505] rounded-full"></div>
                  <div className="absolute -right-4 w-8 h-8 bg-[#050505] rounded-full"></div>
                  <div className="w-[80%] border-t-2 border-dashed border-gray-300"></div>
                </div>

                <div className="p-10 pt-6">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-2">
                        Tổng cộng
                      </span>
                      <span className="text-4xl font-noto font-black tracking-tight">
                        MIỄN PHÍ
                      </span>
                    </div>
                    <div className="text-gray-200 text-4xl opacity-50">
                      <FaGlobe />
                    </div>
                  </div>

                  <button
                    onClick={handleRegister}
                    disabled={isRegistering || selectedActivityIds.length === 0}
                    className={`
                            w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300
                            ${
                              isRegistering || selectedActivityIds.length === 0
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-black text-white hover:bg-[#B5A65F] hover:text-black hover:shadow-xl hover:scale-[1.02]"
                            }
                        `}
                  >
                    {isRegistering
                      ? "Đang xử lý..."
                      : hasJoinedEvent
                        ? "XÁC NHẬN THÊM"
                        : "XÁC NHẬN ĐĂNG KÝ"}
                  </button>

                  <p className="text-center text-[9px] text-gray-400 mt-6 font-medium uppercase tracking-wide opacity-50">
                    * Vé điện tử sẽ được gửi qua email của bạn
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedActivityIds.length > 0 && (
          <div className="lg:hidden fixed bottom-6 inset-x-0 z-50 px-6">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-4 flex items-center justify-between text-black"
            >
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-500">
                  Đã chọn
                </span>
                <div className="font-black text-xl">
                  {selectedActivityIds.length}{" "}
                  <span className="text-xs font-normal">mục</span>
                </div>
              </div>
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="bg-black text-white px-6 py-3 rounded-full font-bold uppercase text-xs tracking-wider"
              >
                {isRegistering ? "..." : "Xác nhận"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
