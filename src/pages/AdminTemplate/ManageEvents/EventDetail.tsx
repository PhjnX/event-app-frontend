import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import {
  FaPlus,
  FaTrashAlt,
  FaMapPin,
  FaUserTie,
  FaTimes,
  FaEdit,
  FaArrowLeft,
  FaPen,
  FaCalendarAlt,
  FaClock,
  FaLayerGroup,
  FaUsers,
  FaHistory,
} from "react-icons/fa";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchActivitiesByEvent,
  fetchActivityCategories,
  createActivity,
  deleteActivity,
  updateActivity,
} from "../../../store/slices/activitySlice";
import {
  fetchPresenters,
  fetchMyPresenters,
} from "../../../store/slices/presenterSlice";
import apiService from "../../../services/apiService";
import type { Event } from "../../../models/event";
import type { Activity } from "../../../models/activity";
import LoadingScreen from "@/pages/HomeTemplate/_components/common/LoadingSrceen";
import ConfirmModal from "./../_components/ConfirmModal";
import { ROLES } from "@/constants";
import OptimizedImage from "@/components/ui/OptimizedImage";

const parseDateTimeToInput = (isoString: string) => {
  if (!isoString) return { date: "", time: "" };
  const [datePart, timeFull] = isoString.split("T");
  const timePart = timeFull ? timeFull.substring(0, 5) : "";
  return { date: datePart, time: timePart };
};

const combineToISO = (dateVal: string, timeVal: string) => {
  if (!dateVal || !timeVal) return "";
  return `${dateVal}T${timeVal}:00`;
};

const formatDisplayTime = (isoString: string) => {
  if (!isoString) return "";
  const timePart = isoString.split("T")[1];
  return timePart ? timePart.substring(0, 5) : "";
};
const formatShortDate = (isoString: string) => {
  if (!isoString) return "";
  const datePart = isoString.split("T")[0];
  const [m, d] = datePart.split("-");
  return `${d}/${m}`;
};

const formatFullDate = (isoString: string) => {
  if (!isoString) return "";
  const d = new Date(isoString.endsWith("Z") ? isoString : `${isoString}Z`);
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const isSameDay = (date1: string, date2: string) => {
  if (!date1 || !date2) return false;
  return date1.split("T")[0] === date2.split("T")[0];
};

const getDayDiff = (date1: string, date2: string) => {
  if (!date1 || !date2) return 0;
  const d1 = new Date(date1.split("T")[0]);
  const d2 = new Date(date2.split("T")[0]);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export default function EventDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const isOrganizer =
    user?.role === ROLES.ORGANIZER || user?.role === "ORGANIZER";
  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const canManage =
    isOrganizer &&
    event &&
    (event.status === "DRAFT" || event.status === "REJECTED");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(
    null,
  );
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: number | null;
  }>({ isOpen: false, id: null });

  const { data: activities, categories } = useSelector(
    (state: RootState) => state.activities,
  );
  const { data: presenters } = useSelector(
    (state: RootState) => state.presenters,
  );

  const [actForm, setActForm] = useState({
    activityName: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    roomOrVenue: "",
    categoryId: 0,
    presenterIds: [] as number[],
    maxAttendees: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiService.get<Event>(`/events/${slug}`);
        setEvent(res);
        if (res.eventId) {
          dispatch(fetchActivitiesByEvent(res.eventId));
          dispatch(fetchActivityCategories());
          if (isOrganizer) {
            dispatch(fetchMyPresenters());
          } else {
            dispatch(fetchPresenters());
          }
        }
      } catch (error) {
        toast.error("Không thể tải thông tin sự kiện");
      } finally {
        setLoadingEvent(false);
      }
    };
    if (slug) loadData();
  }, [slug, dispatch]);

  const handleSelectPresenter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    if (id === 0) return;
    if (!actForm.presenterIds.includes(id)) {
      setActForm((prev) => ({
        ...prev,
        presenterIds: [...prev.presenterIds, id],
      }));
    }
    e.target.value = "0";
  };

  const handleRemovePresenter = (idToRemove: number) => {
    setActForm((prev) => ({
      ...prev,
      presenterIds: prev.presenterIds.filter((id) => id !== idToRemove),
    }));
  };

  const handleOpenAddModal = () => {
    if (!event) return;
    setIsEditMode(false);
    setEditingActivityId(null);
    const eventTime = parseDateTimeToInput(event.startDate);
    setActForm({
      activityName: "",
      description: "",
      startDate: eventTime.date,
      startTime: "07:00",
      endDate: eventTime.date,
      endTime: "09:00",
      roomOrVenue: event.location || "",
      categoryId: 0,
      presenterIds: [],
      maxAttendees: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (activity: Activity) => {
    setIsEditMode(true);
    setEditingActivityId(activity.activityId);
    const start = parseDateTimeToInput(activity.startTime);
    const end = parseDateTimeToInput(activity.endTime);

    const existingPresenters =
      (activity as any).presenters ||
      (activity.presenter ? [activity.presenter] : []);
    const existingIds = existingPresenters.map((p: any) => p.presenterId);

    setActForm({
      activityName: activity.activityName,
      description: activity.description || "",
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
      roomOrVenue: activity.roomOrVenue || "",
      categoryId: activity.category?.categoryId || 0,
      presenterIds: existingIds,
      maxAttendees: (activity as any).maxAttendees
        ? (activity as any).maxAttendees.toString()
        : "",
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    const startISO = combineToISO(actForm.startDate, actForm.startTime);
    const endISO = combineToISO(actForm.endDate, actForm.endTime);

    const actStart = new Date(startISO);
    const actEnd = new Date(endISO);

    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);

    if (actStart >= actEnd) {
      toast.warn("Giờ kết thúc hoạt động phải sau giờ bắt đầu!");
      return;
    }

    if (actStart < eventStart) {
      toast.warn(
        `Hoạt động không được bắt đầu trước sự kiện! (Sự kiện bắt đầu lúc: ${formatDisplayTime(
          event.startDate,
        )} ${formatShortDate(event.startDate)})`,
      );
      return;
    }

    if (actEnd > eventEnd) {
      toast.warn(
        `Hoạt động không được kết thúc sau sự kiện! (Sự kiện kết thúc lúc: ${formatDisplayTime(
          event.endDate,
        )} ${formatShortDate(event.endDate)})`,
      );
      return;
    }

    try {
      const payload = {
        eventId: event.eventId,
        activityName: actForm.activityName,
        description: actForm.description,
        roomOrVenue: actForm.roomOrVenue,
        categoryId: Number(actForm.categoryId),
        startTime: startISO,
        endTime: endISO,
        maxAttendees: actForm.maxAttendees ? Number(actForm.maxAttendees) : 0,
        presenterId:
          actForm.presenterIds.length > 0 ? actForm.presenterIds[0] : null,
        accessibleTo: [],
        materialsUrl: "",
      };

      if (isEditMode && editingActivityId) {
        await dispatch(
          updateActivity({ id: editingActivityId, data: payload as any }),
        ).unwrap();
        toast.success("Cập nhật thành công!");
      } else {
        await dispatch(createActivity(payload as any)).unwrap();
        toast.success("Thêm hoạt động thành công!");
      }
      dispatch(fetchActivitiesByEvent(event.eventId));
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  const handleQuickCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await apiService.post("/activity-categories", {
        categoryName: newCategoryName,
        description: "Quick Add",
      });
      toast.success("Đã tạo loại hoạt động!");
      setNewCategoryName("");
      setIsCreatingCategory(false);
      dispatch(fetchActivityCategories());
    } catch {
      toast.error("Lỗi tạo loại.");
    }
  };

  const openDeleteModal = (id: number) =>
    setConfirmDelete({ isOpen: true, id });

  const handleConfirmDelete = async () => {
    if (confirmDelete.id) {
      try {
        await dispatch(deleteActivity(confirmDelete.id)).unwrap();
        toast.success("Đã xóa hoạt động");
      } catch {
        toast.error("Xóa thất bại");
      }
      setConfirmDelete({ isOpen: false, id: null });
    }
  };

  const groupedActivities = useMemo(() => {
    const sorted = [...activities].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
    const groups: { [key: string]: Activity[] } = {};
    sorted.forEach((act) => {
      const dateKey = act.startTime.split("T")[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(act);
    });
    return groups;
  }, [activities]);

  if (loadingEvent) return <LoadingScreen />;
  if (!event)
    return (
      <div className="text-white pt-20 text-center">Không tìm thấy sự kiện</div>
    );

  const modalLabelStyle =
    "text-[11px] text-[#B5A65F] uppercase font-bold tracking-wider mb-2 flex items-center gap-2";
  const modalInputStyle =
    "w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#B5A65F] outline-none transition-all placeholder-gray-700 text-sm font-medium";

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-noto pb-20 selection:bg-[rgba(181,166,95,0.3)]">
      <div className="bg-[rgba(5,5,5,0.8)] border-b border-white/5 top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#B5A65F] transition-colors font-medium text-sm group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại danh sách</span>
          </Link>
        </div>
      </div>

      <div className="relative h-[50vh] min-h-[400px] w-full group overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-[rgba(5,5,5,0.6)] to-[rgba(5,5,5,0)] z-10" />
          <OptimizedImage
            src={event.bannerImageUrl}
            alt={event.eventName}
            width={1920}
            height={800}
            priority={true}
            className="w-full h-full"
            imgClassName="transition-transform duration-2000 ease-out group-hover:scale-105"
          />
        </div>

        <div className="absolute bottom-0 left-0 w-full z-20 p-6 md:p-12 lg:p-16">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <span
                  className={`px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-widest ${
                    event.status === "APPROVED" || event.status === "PUBLISHED"
                      ? "bg-[rgba(34,197,94,0.1)] border-green-500/50 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                      : "bg-[rgba(107,114,128,0.1)] border-gray-500/50 text-gray-400"
                  }`}
                >
                  {event.status}
                </span>
                <div className="h-px w-12 bg-[rgba(181,166,95,0.5)]"></div>
                <span className="text-[#B5A65F] font-bold text-sm tracking-[0.2em] uppercase">
                  {event.organizerName}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase text-white leading-[1.1] mb-6 drop-shadow-2xl">
                {event.eventName}
              </h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-gray-300">
                <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.05)] backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                  <div className="p-2 bg-primary-gold-low rounded-lg text-[#B5A65F]">
                    <FaCalendarAlt size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">
                      Ngày bắt đầu
                    </div>
                    <div className="font-bold">
                      {formatFullDate(event.startDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.05)] backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                  <div className="p-2 bg-primary-gold-low rounded-lg text-[#B5A65F]">
                    <FaMapPin size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">
                      Địa điểm
                    </div>
                    <div className="font-bold truncate max-w-[200px]">
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-20">
        <div className="lg:col-span-4 space-y-8">
          {canManage && (
            <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-xl top-24">
              <h3 className="text-lg font-bold text-white uppercase mb-4 flex items-center gap-2">
                <FaLayerGroup className="text-[#B5A65F]" /> Bảng điều khiển
              </h3>
              <div className="space-y-3">
                <Link
                  to={`/admin/events/${slug}/edit`}
                  className="w-full flex items-center justify-center gap-2 bg-[#1e1e1e] hover:bg-[#252525] border border-white/10 text-white p-4 rounded-xl font-bold transition-all group"
                >
                  <FaEdit className="text-[#B5A65F] group-hover:scale-110 transition-transform" />{" "}
                  Chỉnh sửa sự kiện
                </Link>
                <button
                  onClick={handleOpenAddModal}
                  className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-[#B5A65F] to-[#8E803F] text-black p-4 rounded-xl font-bold shadow-[0_5px_20px_rgba(181,166,95,0.3)] hover:-translate-y-1 transition-all"
                >
                  <FaPlus /> Thêm hoạt động mới
                </button>
              </div>
            </div>
          )}

          {!canManage && isOrganizer && (
            <div className="bg-[rgba(59,130,246,0.1)] border border-blue-500/30 p-4 rounded-xl text-blue-400 text-sm italic">
              Sự kiện đang ở trạng thái <strong>{event.status}</strong>. Bạn
              không thể chỉnh sửa hoạt động lúc này.
            </div>
          )}

          <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xl font-bold text-white uppercase mb-6 flex items-center gap-3 pb-4 border-b border-white/5">
              <span className="w-1.5 h-6 bg-[#B5A65F] rounded-full shadow-[0_0_10px_#B5A65F]"></span>{" "}
              Giới thiệu
            </h3>
            <div className="text-gray-400 leading-7 text-sm whitespace-pre-line text-justify font-light italic">
              {event.description || "Chưa có mô tả chi tiết cho sự kiện này."}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-black uppercase text-white mb-2">
              Lịch Trình <span className="text-[#B5A65F]">Chi Tiết</span>
            </h2>
            <p className="text-gray-500">
              Danh sách các hoạt động diễn ra trong suốt sự kiện
            </p>
          </div>

          <div className="space-y-12">
            {Object.keys(groupedActivities).length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-[rgba(255,255,255,0.02)]">
                <FaClock className="text-6xl text-white/10 mb-4" />
                <p className="text-gray-500 font-medium">
                  Chưa có hoạt động nào được lên lịch
                </p>
              </div>
            )}

            {Object.keys(groupedActivities).map((dateKey) => (
              <div key={dateKey} className="relative">
                <div className="mb-8 flex items-center gap-4 top-20 z-30 bg-[#050505] py-2">
                  <div className="bg-[#B5A65F] text-black font-black text-sm px-4 py-2 rounded-lg uppercase tracking-wider shadow-[0_0_15px_rgba(181,166,95,0.4)]">
                    {new Date(dateKey).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </div>
                  <div className="h-px flex-1 bg-linear-to-r from-[rgba(181,166,95,0.5)] to-primary-gold-transparent"></div>
                </div>

                <div className="relative pl-8 border-l-2 border-white/10 ml-4 space-y-8">
                  {groupedActivities[dateKey].map((act, idx) => {
                    const isMultiDay = !isSameDay(act.startTime, act.endTime);
                    const daysDuration = getDayDiff(act.startTime, act.endTime);

                    return (
                      <motion.div
                        key={act.activityId}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative"
                      >
                        <div className="absolute -left-[39px] top-6 w-4 h-4 rounded-full bg-[#121212] border-2 border-gray-600 group-hover:border-[#B5A65F] transition-all z-20 shadow-[0_0_0_4px_#050505]" />

                        <div className="bg-[#121212] hover:bg-[#1a1a1a] border border-white/10 hover:border-[#B5A65F]/40 p-5 rounded-2xl transition-all flex flex-col md:flex-row gap-6 shadow-xl hover:translate-x-2">
                          <div className="min-w-[120px] border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 pr-4 flex flex-col justify-center">
                            <span className="text-2xl font-black text-[#B5A65F] font-mono tracking-tighter">
                              {formatDisplayTime(act.startTime)}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-500 font-mono">
                                đến {formatDisplayTime(act.endTime)}
                              </span>
                              {isMultiDay && (
                                <span className="text-[9px] text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded mt-1 border border-red-500/20">
                                  {formatShortDate(act.endTime)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <div className="flex gap-2 items-center mb-2">
                                  <div className="bg-[rgba(255,255,255,0.05)] text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-white/5">
                                    {act.category?.categoryName || "General"}
                                  </div>
                                  {isMultiDay && (
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                      <FaHistory size={10} /> Kéo dài{" "}
                                      {daysDuration} ngày
                                    </div>
                                  )}
                                </div>
                                <h3 className="text-xl font-bold text-white group-hover:text-[#B5A65F] transition-colors">
                                  {act.activityName}
                                </h3>
                              </div>
                              {canManage && (
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                  <button
                                    onClick={() => handleOpenEditModal(act)}
                                    className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
                                  >
                                    <FaPen size={12} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      openDeleteModal(act.activityId)
                                    }
                                    className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                  >
                                    <FaTrashAlt size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mt-2 mb-4 line-clamp-2">
                              {act.description}
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {act.roomOrVenue && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
                                  <FaMapPin className="text-[#B5A65F]" />{" "}
                                  {act.roomOrVenue}
                                </div>
                              )}

                              {(act as any).presenters &&
                              (act as any).presenters.length > 0 ? (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
                                  <FaUserTie className="text-[#B5A65F]" />
                                  {(act as any).presenters
                                    .map((p: any) => p.fullName)
                                    .join(", ")}
                                </div>
                              ) : act.presenter ? (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
                                  <FaUserTie className="text-[#B5A65F]" />
                                  {act.presenter.fullName}
                                </div>
                              ) : null}

                              {(act as any).maxAttendees > 0 && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
                                  <FaUsers className="text-[#B5A65F]" /> Max:{" "}
                                  {(act as any).maxAttendees}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#141414] border border-white/10 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
            >
              <div className="px-6 py-5 border-b border-white/10 bg-[#1a1a1a] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  {isEditMode ? (
                    <FaEdit className="text-[#B5A65F]" />
                  ) : (
                    <FaPlus className="text-[#B5A65F]" />
                  )}{" "}
                  {isEditMode ? "Cập Nhật Hoạt Động" : "Thêm Hoạt Động Mới"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 overflow-y-auto grow custom-scrollbar bg-[#141414]">
                <form
                  id="activity-form"
                  onSubmit={handleSubmitForm}
                  className="space-y-6"
                >
                  <div>
                    <label className={modalLabelStyle}>
                      Tên hoạt động <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      className={`${modalInputStyle} text-lg font-bold`}
                      value={actForm.activityName}
                      onChange={(e) =>
                        setActForm({ ...actForm, activityName: e.target.value })
                      }
                      placeholder="VD: Khai mạc & Welcome Teabreak"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
                    <div className="space-y-2">
                      <label className="text-[10px] text-green-400 font-bold uppercase">
                        Bắt đầu
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          required
                          className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2 py-2 text-xs text-white flex-1 outline-none focus:border-green-500"
                          value={actForm.startDate}
                          onChange={(e) =>
                            setActForm({
                              ...actForm,
                              startDate: e.target.value,
                            })
                          }
                          style={{ colorScheme: "dark" }}
                        />
                        <input
                          type="time"
                          required
                          className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2 py-2 text-xs text-white w-24 outline-none focus:border-green-500"
                          value={actForm.startTime}
                          onChange={(e) =>
                            setActForm({
                              ...actForm,
                              startTime: e.target.value,
                            })
                          }
                          style={{ colorScheme: "dark" }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-red-400 font-bold uppercase">
                        Kết thúc
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          required
                          className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2 py-2 text-xs text-white flex-1 outline-none focus:border-red-500"
                          value={actForm.endDate}
                          onChange={(e) =>
                            setActForm({ ...actForm, endDate: e.target.value })
                          }
                          style={{ colorScheme: "dark" }}
                        />
                        <input
                          type="time"
                          required
                          className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2 py-2 text-xs text-white w-24 outline-none focus:border-red-500"
                          value={actForm.endTime}
                          onChange={(e) =>
                            setActForm({ ...actForm, endTime: e.target.value })
                          }
                          style={{ colorScheme: "dark" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={modalLabelStyle}>
                        Địa điểm / Phòng
                      </label>
                      <div className="relative">
                        <FaMapPin className="absolute left-3 top-3.5 text-gray-500" />
                        <input
                          type="text"
                          className={`${modalInputStyle} pl-9`}
                          value={actForm.roomOrVenue}
                          onChange={(e) =>
                            setActForm({
                              ...actForm,
                              roomOrVenue: e.target.value,
                            })
                          }
                          placeholder="VD: Sảnh A"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={modalLabelStyle}>Danh mục</label>
                      <select
                        className={modalInputStyle}
                        value={actForm.categoryId}
                        onChange={(e) =>
                          setActForm({
                            ...actForm,
                            categoryId: Number(e.target.value),
                          })
                        }
                      >
                        <option value={0}>-- Chọn loại --</option>
                        {categories.map((c) => (
                          <option key={c.categoryId} value={c.categoryId}>
                            {c.categoryName}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          setIsCreatingCategory(!isCreatingCategory)
                        }
                        className="text-[10px] text-[#B5A65F] mt-2 font-bold flex items-center gap-1 hover:underline"
                      >
                        <FaPlus size={8} /> Tạo loại mới
                      </button>
                      {isCreatingCategory && (
                        <div className="flex gap-2 mt-2">
                          <input
                            autoFocus
                            type="text"
                            className="bg-[#0a0a0a] border border-[#B5A65F] rounded px-2 py-1 text-xs text-white flex-1"
                            placeholder="Tên loại..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={handleQuickCreateCategory}
                            className="px-2 py-1 bg-[#B5A65F] text-black text-xs font-bold rounded"
                          >
                            Lưu
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={modalLabelStyle}>Diễn giả</label>
                      <select
                        className={modalInputStyle}
                        onChange={handleSelectPresenter}
                        defaultValue={0}
                      >
                        <option value={0}>+ Thêm diễn giả</option>
                        {presenters
                          .filter(
                            (p) =>
                              !actForm.presenterIds.includes(p.presenterId),
                          )
                          .map((p) => (
                            <option key={p.presenterId} value={p.presenterId}>
                              {p.fullName}
                            </option>
                          ))}
                      </select>
                      <div className="flex flex-wrap gap-2 mt-3 min-h-[30px]">
                        {actForm.presenterIds.map((id) => {
                          const p = presenters.find(
                            (x) => x.presenterId === id,
                          );
                          return (
                            p && (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#B5A65F]/20 border border-[#B5A65F]/40 text-[#B5A65F] text-[10px] font-bold"
                              >
                                {p.fullName}
                                <FaTimes
                                  className="cursor-pointer hover:text-white"
                                  onClick={() => handleRemovePresenter(id)}
                                />
                              </span>
                            )
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className={modalLabelStyle}>
                        Giới hạn người (Max)
                      </label>
                      <input
                        type="number"
                        className={modalInputStyle}
                        value={actForm.maxAttendees}
                        onChange={(e) =>
                          setActForm({
                            ...actForm,
                            maxAttendees: e.target.value,
                          })
                        }
                        placeholder="0 = Không giới hạn"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={modalLabelStyle}>Mô tả nội dung</label>
                    <textarea
                      rows={4}
                      className={`${modalInputStyle} resize-none`}
                      value={actForm.description}
                      onChange={(e) =>
                        setActForm({ ...actForm, description: e.target.value })
                      }
                      placeholder="Chi tiết hoạt động..."
                    />
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-white/10 bg-[#1a1a1a] flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 font-bold text-sm hover:text-white transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  form="activity-form"
                  className="px-8 py-2.5 rounded-xl bg-[#B5A65F] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#c9ba6e] shadow-lg transition-all transform active:scale-95"
                >
                  Lưu Lại
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        type="DELETE"
        title="Xóa hoạt động?"
        message="Bạn có chắc chắn muốn xóa hoạt động này khỏi lịch trình?"
        confirmText="Xóa ngay"
      />
    </div>
  );
}
