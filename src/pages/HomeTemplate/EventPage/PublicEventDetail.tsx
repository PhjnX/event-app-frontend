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
  FaCalendarCheck,
} from "react-icons/fa";
import { toast } from "react-toastify";

import apiService from "@/services/apiService";
import { registerForEvent } from "@/store/slices/eventSlice";
import type { AppDispatch, RootState } from "@/store";
import LoadingScreen from "../_components/common/LoadingSrceen";
import type { Event } from "@/models/event";
import type { Activity } from "@/models/activity";
import type { Presenter } from "@/models/presenter";

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
    []
  );

  const { scrollYProgress } = useScroll();
  const scaleImage = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventRes = await apiService.get<Event>(`/events/${slug}`);
        setEvent(eventRes);
        if (eventRes.eventId) {
          const actRes = await apiService.get<Activity[]>(
            `/activities/by-event/${eventRes.eventId}`
          );

          const sortedActs = actRes.sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          setActivities(sortedActs);

          const alreadyRegistered = actRes
            .filter((a: any) => a.isRegistered === true)
            .map((a) => a.activityId);
          setRegisteredActivityIds(alreadyRegistered);

          const uniquePresenters = Array.from(
            new Map(
              actRes
                .filter((a) => a.presenter)
                .map((a) => [a.presenter.presenterId, a.presenter])
            ).values()
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
  }, [slug]);

  const formatTime = (isoTime: string) => {
    return isoTime.split("T")[1].substring(0, 5);
  };

  const toggleActivity = (activityId: number) => {
    if (registeredActivityIds.includes(activityId)) {
      return;
    }
    setSelectedActivityIds((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleRegister = async () => {
    if (!user) return toast.warn("Vui lòng đăng nhập để đăng ký!");
    if (!event || selectedActivityIds.length === 0)
      return toast.warn("Bạn chưa chọn hoạt động nào!");

    setIsRegistering(true);
    try {
      await dispatch(
        registerForEvent({
          eventId: event.eventId,
          activityIds: selectedActivityIds,
        })
      ).unwrap();

      toast.success("🎉 Đăng ký thành công! Vé đã được gửi.");
      setRegisteredActivityIds((prev) => [...prev, ...selectedActivityIds]);
      setSelectedActivityIds([]);
    } catch (error: any) {
      toast.error(error?.message || "Đăng ký thất bại.");
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

      <section className="relative pt-12 pb-20 overflow-hidden">
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
              <div>
                <span className="text-[#B5A65F] uppercase text-[10px] tracking-widest block mb-1">
                  Thời gian
                </span>
                <span className="text-white">
                  {new Date(event.startDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div>
                <span className="text-[#B5A65F] uppercase text-[10px] tracking-widest block mb-1">
                  Địa điểm
                </span>
                <span className="text-white">{event.location}</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            style={{ scale: scaleImage }}
            className="mt-12 relative h-[300px] md:h-[500px] rounded-4xl overflow-hidden border border-white/10"
          >
            <img
              src={event.bannerImageUrl}
              className="w-full h-full object-cover"
              alt=""
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-transparent to-transparent opacity-80" />
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <p className="text-lg md:text-xl font-light leading-relaxed text-gray-300">
              <span className="text-[#B5A65F] text-4xl float-left mr-2 font-black">
                "
              </span>
              {event.description}
            </p>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                Danh sách Hoạt động
              </h3>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="flex flex-col gap-5">
              {activities.map((act) => {
                const isSelected = selectedActivityIds.includes(act.activityId);
                const isRegistered = registeredActivityIds.includes(
                  act.activityId
                );

                let cardClasses = "";
                let borderClass = "";
                let textTitle = "text-white";

                if (isRegistered) {
                  cardClasses = "bg-[#0c160c] opacity-80 cursor-default";
                  borderClass = "border-green-800/30";
                  textTitle = "text-gray-300";
                } else if (isSelected) {
                  cardClasses =
                    "bg-[#B5A65F] shadow-[0_0_25px_rgba(181,166,95,0.4)] transform scale-[1.01] z-10";
                  borderClass = "border-[#B5A65F]";
                  textTitle = "text-black";
                } else {
                  cardClasses = "bg-[#161616] hover:bg-[#1f1f1f]";
                  borderClass = "border-white/10 group-hover:border-white/20";
                }

                return (
                  <motion.div
                    key={act.activityId}
                    layout
                    onClick={() => toggleActivity(act.activityId)}
                    className={`group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${cardClasses} ${borderClass}`}
                  >
                    <div
                      className={`
                                flex flex-row sm:flex-col items-center sm:justify-center justify-between
                                p-5 sm:w-32 sm:border-r border-dashed shrink-0
                                ${
                                  isRegistered
                                    ? "border-green-800/30 bg-green-900/10"
                                    : isSelected
                                    ? "border-black/20 bg-black/5"
                                    : "border-white/10 bg-white/5"
                                }
                            `}
                    >
                      <div
                        className={`text-xl sm:text-2xl font-black ${textTitle}`}
                      >
                        {formatTime(act.startTime)}
                      </div>
                      <FaClock
                        className={`hidden sm:block my-2 text-xs ${
                          isRegistered || !isSelected
                            ? "text-gray-500"
                            : "text-black/50"
                        }`}
                      />
                      <div
                        className={`text-sm font-medium ${
                          isRegistered || !isSelected
                            ? "text-gray-400"
                            : "text-black/70"
                        }`}
                      >
                        {formatTime(act.endTime)}
                      </div>
                    </div>

                    <div className="flex-1 p-5 flex flex-col justify-center">
                      <h4
                        className={`text-lg font-bold uppercase mb-2 leading-tight ${textTitle}`}
                      >
                        {act.activityName}
                      </h4>
                      <p
                        className={`text-sm mb-4 line-clamp-2 ${
                          isRegistered || !isSelected
                            ? "text-gray-400"
                            : "text-black/70"
                        }`}
                      >
                        {act.description}
                      </p>

                      {act.presenter && (
                        <div
                          className={`
                                        flex items-center gap-3 p-2 pr-4 rounded-xl w-fit transition-colors border
                                        ${
                                          isRegistered
                                            ? "bg-green-900/20 border-green-500/10"
                                            : isSelected
                                            ? "bg-black/10 border-black/5"
                                            : "bg-white/5 border-white/5"
                                        }
                                    `}
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-current/20 shrink-0">
                            <img
                              src={act.presenter.avatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div
                              className={`text-[10px] font-bold uppercase ${textTitle}`}
                            >
                              {act.presenter.fullName}
                            </div>
                            <div
                              className={`text-[9px] uppercase tracking-wider ${
                                isRegistered || !isSelected
                                  ? "text-[#B5A65F]"
                                  : "text-black/60 font-bold"
                              }`}
                            >
                              {act.presenter.title}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center p-4 min-w-[60px]">
                      {isRegistered ? (
                        <FaCheckCircle className="text-2xl text-green-700 opacity-80" />
                      ) : isSelected ? (
                        <FaCheckCircle className="text-3xl text-black drop-shadow-md" />
                      ) : (
                        <FaRegCircle className="text-2xl text-gray-600 group-hover:text-[#B5A65F] transition-colors" />
                      )}
                    </div>

                    {isRegistered && (
                      <div className="absolute top-0 right-0 z-10 bg-green-900/90 text-green-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-green-500/20">
                        SỞ HỮU
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-8 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                Tất cả Khách mời
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {presenters.map((p) => (
                <div
                  key={p.presenterId}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5"
                >
                  <img
                    src={p.avatarUrl}
                    className="w-full h-full object-cover transition-all duration-500"
                    alt=""
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/90 to-transparent">
                    <p className="text-xs font-bold text-white truncate">
                      {p.fullName}
                    </p>
                    <p className="text-[9px] text-[#B5A65F] uppercase">
                      {p.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28 transition-all duration-300 h-fit">
            <div className="bg-[#121212] border border-[#B5A65F]/60 rounded-3xl p-8 relative shadow-2xl overflow-hidden">
              <div className="absolute -left-3 top-[65%] w-6 h-6 bg-[#050505] rounded-full "></div>
              <div className="absolute -right-3 top-[65%] w-6 h-6 bg-[#050505] rounded-full"></div>
              <div className="absolute left-4 right-4 top-[65%] h-px border-t border-dashed border-[#B5A65F]/30"></div>

              <h2 className="text-2xl font-serif font-bold text-white mb-4">
                Đăng ký tham gia
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-8">
                Chọn các phiên (session) hoạt động mà bạn mong muốn tham gia ở
                danh sách bên trái.
              </p>

              <div className="space-y-4 mb-12">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Hoạt động đã chọn</span>
                  <span className="text-xl font-black text-white">
                    {selectedActivityIds.length}
                  </span>
                </div>
                {registeredActivityIds.length > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Vé đã sở hữu</span>
                    <span className="font-bold text-green-500 flex items-center gap-1">
                      <FaCalendarCheck /> {registeredActivityIds.length}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm pt-4 border-t border-white/5">
                  <span className="text-gray-400">Giá vé dự kiến</span>
                  <span className="text-[#B5A65F] font-bold tracking-widest uppercase">
                    Miễn phí
                  </span>
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={isRegistering || selectedActivityIds.length === 0}
                className={`
                            w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all
                            ${
                              isRegistering || selectedActivityIds.length === 0
                                ? "bg-[#B5A65F]/20 text-[#B5A65F]/50 cursor-not-allowed"
                                : "bg-[#B5A65F] text-black hover:bg-[#cfbd6b] shadow-[0_0_20px_rgba(181,166,95,0.4)]"
                            }
                        `}
              >
                {isRegistering ? (
                  <span className="animate-pulse">Đang xử lý...</span>
                ) : (
                  <>
                    <FaTicketAlt /> Xác nhận Đăng ký
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-gray-600 mt-6 italic">
                * Bạn sẽ nhận được vé QR qua email sau khi hoàn tất.
              </p>
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
              className="bg-[#121212] border border-[#B5A65F] rounded-2xl shadow-2xl p-4 flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400">
                  Đã chọn
                </span>
                <div className="text-white font-black text-xl flex items-center gap-2">
                  {selectedActivityIds.length}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    hoạt động
                  </span>
                </div>
              </div>
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="bg-[#B5A65F] text-black px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider"
              >
                {isRegistering ? "..." : "Đăng ký ngay"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
