import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaArrowLeft,
  FaTicketAlt,
  FaShareAlt,
  FaCheckCircle,
  FaRegCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";

import apiService from "@/services/apiService";
import { registerForEvent } from "@/store/slices/eventSlice";
import type { AppDispatch, RootState } from "@/store";
import LoadingScreen from "../_components/common/LoadingSrceen";
import type { Event } from "@/models/event";
import type { Activity } from "@/models/activity";
import type { Presenter } from "@/models/presenter";

const ensureUTC = (isoString: string) =>
  isoString && !isoString.endsWith("Z") ? `${isoString}Z` : isoString;

const formatDateTime = (isoString: string, type: "date" | "time") => {
  if (!isoString) return "";
  const d = new Date(ensureUTC(isoString));
  if (type === "date") {
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventRes = await apiService.get<Event>(`/events/${slug}`);
        setEvent(eventRes);

        if (eventRes.eventId) {
          const actRes = await apiService.get<Activity[]>(
            `/activities/by-event/${eventRes.eventId}`
          );
          setActivities(actRes);


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

  const toggleActivity = (activityId: number) => {
    setSelectedActivityIds((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleRegister = async () => {
    if (!user) {
      toast.warn("Vui lòng đăng nhập để đăng ký!");
      return;
    }
    if (!event) return;

    if (selectedActivityIds.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một hoạt động để tham gia!");
      return;
    }

    if (user.role === "SADMIN" || user.role === "ORGANIZER") {
      toast.info("Tài khoản quản trị không cần đăng ký.");
      return;
    }

    setIsRegistering(true);
    try {
      const payload = {
        eventId: event.eventId,
        activityIds: selectedActivityIds,
      };

      await dispatch(registerForEvent(payload)).unwrap();
      toast.success("🎉 Đăng ký thành công! Vé đã được gửi về email của bạn.");
      setSelectedActivityIds([]); // Reset sau khi đăng ký
    } catch (error: any) {
      toast.error(error || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!event)
    return (
      <div className="text-white text-center pt-32 h-screen bg-[#0a0a0a]">
        Không tìm thấy sự kiện.
      </div>
    );

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-noto text-white pb-20">
      <div className="relative h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-black/50 to-transparent z-10"></div>
        <img
          src={event.bannerImageUrl || "https://via.placeholder.com/1920x600"}
          alt={event.eventName}
          className="w-full h-full object-cover"
        />

        <Link
          to="/events"
          className="absolute top-24 left-4 md:left-10 z-20 flex items-center gap-2 text-white/70 hover:text-[#B5A65F] transition-colors bg-black/30 px-4 py-2 rounded-full backdrop-blur-md"
        >
          <FaArrowLeft /> Quay lại danh sách
        </Link>

        <div className="absolute bottom-0 left-0 w-full z-20 p-6 md:p-16">
          <div className="container mx-auto">
            <span className="px-3 py-1 bg-[#B5A65F] text-black text-xs font-bold uppercase rounded mb-4 inline-block">
              {event.status === "APPROVED" || event.status === "PUBLISHED"
                ? "Sắp diễn ra"
                : event.status}
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase leading-tight max-w-4xl drop-shadow-2xl mb-6">
              {event.eventName}
            </h1>
            <div className="flex flex-wrap gap-6 text-sm md:text-base text-gray-200">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-[#B5A65F]" />{" "}
                <span className="capitalize">
                  {formatDateTime(event.startDate, "date")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-[#B5A65F]" />{" "}
                {formatDateTime(event.startDate, "time")}
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#B5A65F]" /> {event.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h3 className="text-2xl font-bold text-[#B5A65F] uppercase mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-[#B5A65F] inline-block mr-2"></span>{" "}
              Giới thiệu sự kiện
            </h3>
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
              {event.description}
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-[#B5A65F] uppercase mb-8 flex items-center gap-2">
              <span className="w-1 h-8 bg-[#B5A65F] inline-block mr-2"></span>{" "}
              Lịch trình & Đăng ký
            </h3>
            <p className="text-sm text-gray-400 mb-6 italic">
              * Vui lòng chọn các hoạt động bạn muốn tham gia bên dưới.
            </p>

            <div className="space-y-4">
              {activities.length === 0 && (
                <p className="text-gray-500 italic pl-4">
                  Chưa có lịch trình cụ thể.
                </p>
              )}

              {activities.map((act) => {
                const isSelected = selectedActivityIds.includes(act.activityId);
                return (
                  <div
                    key={act.activityId}
                    onClick={() => toggleActivity(act.activityId)}
                    className={`relative group cursor-pointer border rounded-2xl p-5 transition-all duration-300 flex items-start gap-4 ${
                      isSelected
                        ? "bg-[#B5A65F]/10 border-[#B5A65F] shadow-[0_0_20px_rgba(181,166,95,0.1)]"
                        : "bg-[#1a1a1a] border-white/5 hover:border-[#B5A65F]/30"
                    }`}
                  >
                    {/* Checkbox Icon */}
                    <div className="mt-1">
                      {isSelected ? (
                        <FaCheckCircle className="text-[#B5A65F] text-xl" />
                      ) : (
                        <FaRegCircle className="text-gray-600 text-xl group-hover:text-[#B5A65F]" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                        <h4
                          className={`text-lg font-bold transition-colors ${
                            isSelected ? "text-[#B5A65F]" : "text-white"
                          }`}
                        >
                          {act.activityName}
                        </h4>
                        <span className="text-[#B5A65F] font-mono text-xs bg-black/40 px-2 py-1 rounded border border-[#B5A65F]/20 whitespace-nowrap">
                          {formatDateTime(act.startTime, "time")} -{" "}
                          {formatDateTime(act.endTime, "time")}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        {act.description}
                      </p>

                      {/* Presenters */}
                      {(
                        (act as any).presenters ||
                        (act.presenter ? [act.presenter] : [])
                      ).map((p: any) => (
                        <div
                          key={p.presenterId}
                          className="flex items-center gap-2 text-xs text-gray-500 mt-2 border-t border-white/5 pt-2"
                        >
                          <img
                            src={
                              p.avatarUrl || "https://via.placeholder.com/30"
                            }
                            className="w-6 h-6 rounded-full object-cover"
                            alt=""
                          />
                          <span className="text-white font-bold">
                            {p.fullName}
                          </span>
                          <span className="hidden sm:inline"> - {p.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Presenters Section */}
          {presenters.length > 0 && (
            <section>
              <h3 className="text-2xl font-bold text-[#B5A65F] uppercase mb-8 flex items-center gap-2">
                <span className="w-1 h-8 bg-[#B5A65F] inline-block mr-2"></span>{" "}
                Diễn giả
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {presenters.map((p) => (
                  <div
                    key={p.presenterId}
                    className="flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-xl border border-white/5 hover:border-[#B5A65F]/30 transition-colors"
                  >
                    <img
                      src={p.avatarUrl || "https://via.placeholder.com/80"}
                      className="w-16 h-16 rounded-full object-cover border border-[#B5A65F]/30"
                      alt=""
                    />
                    <div>
                      <h4 className="font-bold text-white">{p.fullName}</h4>
                      <p className="text-xs text-[#B5A65F] uppercase tracking-wide">
                        {p.title}
                      </p>
                      <p className="text-xs text-gray-500">{p.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-[#1a1a1a] border border-[#B5A65F] p-6 rounded-3xl shadow-[0_0_30px_rgba(181,166,95,0.1)]">
              <h3 className="text-xl font-bold text-white mb-2">
                Đăng ký tham gia
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Chọn các hoạt động bạn muốn tham gia ở danh sách bên trái.
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                  <span className="text-gray-500">Đã chọn</span>
                  <span className="text-[#B5A65F] font-bold text-lg">
                    {selectedActivityIds.length} hoạt động
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                  <span className="text-gray-500">Giá vé</span>
                  <span className="text-white">Miễn phí</span>
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="w-full py-4 bg-[#B5A65F] text-black font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRegistering ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FaTicketAlt /> Xác nhận đăng ký
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4 italic">
                * Bạn sẽ nhận được email xác nhận kèm vé điện tử.
              </p>
            </div>

            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-3xl">
              <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">
                Nhà tổ chức
              </h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl">
                  🏢
                </div>
                <div>
                  <p className="font-bold text-white truncate max-w-[200px]">
                    {event.organizerName}
                  </p>
                  <button className="text-xs text-[#B5A65F] hover:underline">
                    Xem hồ sơ
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white transition-all flex items-center justify-center gap-2">
                <FaShareAlt /> Chia sẻ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
