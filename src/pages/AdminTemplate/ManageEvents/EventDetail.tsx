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
} from "react-icons/fa";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchActivitiesByEvent,
  fetchActivityCategories,
  createActivity,
  deleteActivity,
  updateActivity,
} from "../../../store/slices/activitySlice";
import { fetchPresenters } from "../../../store/slices/presenterSlice";
import apiService from "../../../services/apiService";
import type { Event } from "../../../models/event";
import type { Activity } from "../../../models/activity";
import LoadingScreen from "@/pages/HomeTemplate/_components/common/LoadingSrceen";
import ConfirmModal from "./../_components/ConfirmModal";
import { ROLES } from "@/constants";

const ensureUTC = (isoString: string) =>
  isoString && !isoString.endsWith("Z") ? `${isoString}Z` : isoString;

const parseDateTimeToInput = (isoString: string) => {
  if (!isoString) return { date: "", time: "" };
  const d = new Date(ensureUTC(isoString));
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

const combineToISO = (dateVal: string, timeVal: string) => {
  if (!dateVal || !timeVal) return "";
  return new Date(`${dateVal}T${timeVal}`).toISOString();
};

const formatDisplayTime = (isoString: string) => {
  const d = new Date(ensureUTC(isoString));
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatFullDate = (isoString: string) => {
  const d = new Date(ensureUTC(isoString));
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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
    null
  );
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: number | null;
  }>({ isOpen: false, id: null });

  const { data: activities, categories } = useSelector(
    (state: RootState) => state.activities
  );
  const { data: presenters } = useSelector(
    (state: RootState) => state.presenters
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
          dispatch(fetchPresenters());
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

    const existingPresenters = (activity as any).presenters
      ? (activity as any).presenters
      : activity.presenter
      ? [activity.presenter]
      : [];

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
    if (new Date(startISO) >= new Date(endISO)) {
      toast.warn("Giờ kết thúc phải sau giờ bắt đầu!");
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
        presenterIds: actForm.presenterIds,
      };

      if (isEditMode && editingActivityId) {
        await dispatch(
          updateActivity({ id: editingActivityId, data: payload })
        ).unwrap();
        toast.success("Cập nhật thành công!");
        dispatch(fetchActivitiesByEvent(event.eventId));
      } else {
        await dispatch(createActivity(payload)).unwrap();
      }
      setIsModalOpen(false);
    } catch (error: any) {
    }
  };

  const handleQuickCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.warn("Nhập tên loại!");
      return;
    }
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

  const openDeleteModal = (id: number) => {
    setConfirmDelete({ isOpen: true, id });
  };

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
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    const groups: { [key: string]: Activity[] } = {};
    sorted.forEach((act) => {
      const dateKey = parseDateTimeToInput(act.startTime).date;
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
    "text-[11px] text-[#B5A65F] uppercase font-bold tracking-wider mb-2 block flex items-center gap-2";
  const modalInputStyle =
    "w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[#B5A65F] outline-none transition-all placeholder-gray-700 font-medium";

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans pb-20 selection:bg-[#B5A65F] selection:text-black">
      {/* 1. THANH ĐIỀU HƯỚNG */}
      <div className="bg-[#050505] border-b border-white/5  top-0 z-50 backdrop-blur-md bg-opacity-80">
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

      {/* 2. HERO BANNER */}
      <div className="relative h-[50vh] min-h-[400px] w-full group overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-[#050505]/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-linear-to-r from-[#050505] via-transparent to-transparent z-10" />
          <img
            src={event.bannerImageUrl}
            alt={event.eventName}
            className="w-full h-full object-cover transition-transform duration-2000 ease-out group-hover:scale-105"
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
                    event.status === "APPROVED"
                      ? "bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                      : "bg-gray-500/10 border-gray-500/50 text-gray-400"
                  }`}
                >
                  {event.status}
                </span>
                <div className="h-px w-12 bg-[#B5A65F]/50"></div>
                <span className="text-[#B5A65F] font-bold text-sm tracking-[0.2em] uppercase glow-text">
                  {event.organizerName}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase text-white leading-[1.1] mb-6 drop-shadow-2xl">
                {event.eventName}
              </h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-gray-300">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                  <div className="p-2 bg-[#B5A65F]/10 rounded-lg text-[#B5A65F]">
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
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                  <div className="p-2 bg-[#B5A65F]/10 rounded-lg text-[#B5A65F]">
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
            <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-xl">
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
                  className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-[#B5A65F] to-[#8E803F] text-black p-4 rounded-xl font-bold shadow-[0_5px_20px_rgba(181,166,95,0.3)] hover:shadow-[0_8px_25px_rgba(181,166,95,0.4)] hover:-translate-y-1 transition-all"
                >
                  <FaPlus /> Thêm hoạt động mới
                </button>
              </div>
            </div>
          )}

          {!canManage && isOrganizer && (
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-blue-400 text-sm">
              Sự kiện đang ở trạng thái <strong>{event.status}</strong>. Bạn
              không thể chỉnh sửa lúc này.
            </div>
          )}

          <div className="bg-[#121212] border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white uppercase mb-6 flex items-center gap-3 pb-4 border-b border-white/5">
              <span className="w-1.5 h-6 bg-[#B5A65F] rounded-full shadow-[0_0_10px_#B5A65F]"></span>{" "}
              Giới thiệu
            </h3>
            <div className="text-gray-400 leading-7 text-sm whitespace-pre-line text-justify font-light">
              {event.description || "Chưa có mô tả chi tiết cho sự kiện này."}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-black uppercase text-white mb-2">
              Lịch Trình Chi Tiết
            </h2>
            <p className="text-gray-500">
              Danh sách các hoạt động diễn ra trong sự kiện
            </p>
          </div>
          <div className="space-y-12">
            {Object.keys(groupedActivities).length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                <FaClock className="text-6xl text-white/10 mb-4" />
                <p className="text-gray-500 font-medium">
                  Chưa có hoạt động nào được lên lịch
                </p>
              </div>
            )}
            {Object.keys(groupedActivities).map((dateKey) => (
              <div key={dateKey} className="relative">
                <div className="top-4 z-30 mb-8 flex items-center gap-4">
                  <div className="bg-[#B5A65F] text-black font-black text-sm px-4 py-2 rounded-lg uppercase tracking-wider shadow-[0_0_15px_rgba(181,166,95,0.4)]">
                    {new Date(dateKey).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </div>
                  <div className="h-px flex-1 bg-linear-to-r from-[#B5A65F]/50 to-transparent"></div>
                </div>
                <div className="relative pl-4 md:pl-8 border-l-2 border-white/10 ml-4 md:ml-0 space-y-8">
                  {groupedActivities[dateKey].map((act, idx) => (
                    <motion.div
                      key={act.activityId}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative group"
                    >
                      <div className="absolute -left-[23px] md:-left-[39px] top-6 w-4 h-4 rounded-full bg-[#121212] border-2 border-gray-600 group-hover:border-[#B5A65F] group-hover:scale-125 transition-all z-20 shadow-[0_0_0_4px_#050505]">
                        <div className="w-full h-full rounded-full bg-[#B5A65F] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 bg-[#121212] hover:bg-[#1a1a1a] border border-white/10 hover:border-[#B5A65F]/40 p-5 rounded-2xl transition-all hover:translate-x-2 group-hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)]">
                        <div className="min-w-[100px] flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 pr-0 md:pr-4">
                          <span className="text-2xl font-black text-[#B5A65F] font-mono tracking-tighter">
                            {formatDisplayTime(act.startTime)}
                          </span>
                          <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                            đến {formatDisplayTime(act.endTime)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 mb-2 border border-white/5">
                                {act.category?.categoryName || "General"}
                              </div>
                              <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-[#B5A65F] transition-colors">
                                {act.activityName}
                              </h3>
                            </div>

                            {canManage && (
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                <button
                                  onClick={() => handleOpenEditModal(act)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                                >
                                  <FaPen size={12} />
                                </button>
                                <button
                                  onClick={() =>
                                    openDeleteModal(act.activityId)
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
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
                                <FaUserTie className="text-[#B5A65F]" />{" "}
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
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#181818] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 bg-[#1a1a1a] border-b border-white/5 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
                    {isEditMode ? "Cập Nhật" : "Thêm Mới"}{" "}
                    <span className="text-[#B5A65F]">Hoạt Động</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                    Điền thông tin chi tiết
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                >
                  <FaTimes size={18} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar grow">
                <form onSubmit={handleSubmitForm} className="space-y-8">
                  <div className="group">
                    <label className={modalLabelStyle}>Tên hoạt động</label>
                    <input
                      required
                      type="text"
                      className={modalInputStyle}
                      value={actForm.activityName}
                      onChange={(e) =>
                        setActForm({ ...actForm, activityName: e.target.value })
                      }
                      placeholder="Nhập tên hoạt động..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-[#0a0a0a] rounded-2xl border border-white/5">
                    <div>
                      <label className="text-xs text-gray-400 font-bold uppercase mb-4 block flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>{" "}
                        Bắt đầu
                      </label>
                      <div className="space-y-4">
                        <input
                          type="date"
                          required
                          className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:border-[#B5A65F] outline-none transition-colors"
                          style={{ colorScheme: "dark" }}
                          value={actForm.startDate}
                          onChange={(e) =>
                            setActForm({
                              ...actForm,
                              startDate: e.target.value,
                            })
                          }
                        />
                        <input
                          type="time"
                          required
                          className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:border-[#B5A65F] outline-none transition-colors"
                          style={{ colorScheme: "dark" }}
                          value={actForm.startTime}
                          onChange={(e) =>
                            setActForm({
                              ...actForm,
                              startTime: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-bold uppercase mb-4 block flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>{" "}
                        Kết thúc
                      </label>
                      <div className="space-y-4">
                        <input
                          type="date"
                          required
                          className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:border-[#B5A65F] outline-none transition-colors"
                          style={{ colorScheme: "dark" }}
                          value={actForm.endDate}
                          onChange={(e) =>
                            setActForm({ ...actForm, endDate: e.target.value })
                          }
                        />
                        <input
                          type="time"
                          required
                          className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:border-[#B5A65F] outline-none transition-colors"
                          style={{ colorScheme: "dark" }}
                          value={actForm.endTime}
                          onChange={(e) =>
                            setActForm({ ...actForm, endTime: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className={modalLabelStyle}>
                        Địa điểm / Phòng
                      </label>
                      <div className="relative group">
                        <FaMapPin className="absolute left-4 top-4 text-gray-600 group-focus-within:text-[#B5A65F] transition-colors" />
                        <input
                          type="text"
                          className={`${modalInputStyle} pl-10`}
                          value={actForm.roomOrVenue}
                          onChange={(e) =>
                            setActForm({
                              ...actForm,
                              roomOrVenue: e.target.value,
                            })
                          }
                          placeholder="VD: Hội trường A..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className={modalLabelStyle}>
                        Giới hạn người (Optional)
                      </label>
                      <div className="relative group">
                        <FaUsers className="absolute left-4 top-4 text-gray-600 group-focus-within:text-[#B5A65F] transition-colors" />
                        <input
                          type="number"
                          min="0"
                          className={`${modalInputStyle} pl-10`}
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className={modalLabelStyle}>Danh mục</label>
                      {!isCreatingCategory ? (
                        <div className="flex gap-2">
                          <select
                            className={`${modalInputStyle} appearance-none cursor-pointer flex-1`}
                            value={actForm.categoryId}
                            onChange={(e) =>
                              setActForm({
                                ...actForm,
                                categoryId: Number(e.target.value),
                              })
                            }
                          >
                            <option value={0} className="text-gray-500">
                              -- Chọn danh mục --
                            </option>
                            {categories.map((c) => (
                              <option key={c.categoryId} value={c.categoryId}>
                                {c.categoryName}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setIsCreatingCategory(true)}
                            className="px-4 bg-[#252525] rounded-xl border border-white/10 hover:border-[#B5A65F] hover:text-[#B5A65F] transition-colors"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-left-4">
                          <input
                            autoFocus
                            type="text"
                            className="flex-1 bg-[#050505] border border-[#B5A65F] rounded-xl px-4 py-3.5 text-white outline-none"
                            placeholder="Nhập tên loại mới..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={handleQuickCreateCategory}
                            className="px-4 bg-[#B5A65F] text-black font-bold rounded-xl hover:bg-[#c4b56a]"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCreatingCategory(false)}
                            className="px-3 text-gray-500 hover:text-white"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={modalLabelStyle}>
                        Diễn giả (Nhiều người)
                      </label>
                      <div className="relative group mb-3">
                        <FaUserTie className="absolute left-4 top-4 text-gray-600 group-focus-within:text-[#B5A65F] transition-colors" />
                        <select
                          className={`${modalInputStyle} pl-10 pr-10 appearance-none cursor-pointer`}
                          onChange={handleSelectPresenter}
                          defaultValue={0} 
                        >
                          <option value={0}>-- Chọn thêm diễn giả --</option>
                          {presenters
                            .filter(
                              (p) =>
                                !actForm.presenterIds.includes(p.presenterId)
                            ) 
                            .map((p) => (
                              <option key={p.presenterId} value={p.presenterId}>
                                {p.fullName}
                              </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-4 pointer-events-none text-xs text-gray-500">
                          ▼
                        </div>
                      </div>

                  
                      <div className="flex flex-wrap gap-2">
                        {actForm.presenterIds.map((id) => {
                          const p = presenters.find(
                            (item) => item.presenterId === id
                          );
                          if (!p) return null;
                          return (
                            <div
                              key={id}
                              className="flex items-center gap-2 bg-[#B5A65F]/20 border border-[#B5A65F]/50 text-[#B5A65F] px-3 py-1.5 rounded-full text-xs font-bold animate-in fade-in zoom-in duration-200"
                            >
                              <span>{p.fullName}</span>
                              <button
                                type="button"
                                onClick={() => handleRemovePresenter(id)}
                                className="w-4 h-4 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/50 transition-colors"
                              >
                                <FaTimes size={8} />
                              </button>
                            </div>
                          );
                        })}
                        {actForm.presenterIds.length === 0 && (
                          <span className="text-gray-600 text-xs italic">
                            Chưa chọn diễn giả nào
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={modalLabelStyle}>Mô tả chi tiết</label>
                    <textarea
                      rows={4}
                      className={`${modalInputStyle} resize-none`}
                      value={actForm.description}
                      onChange={(e) =>
                        setActForm({ ...actForm, description: e.target.value })
                      }
                      placeholder="Nhập nội dung hoạt động..."
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="p-6 bg-[#1a1a1a] border-t border-white/5 shrink-0 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={handleSubmitForm}
                  type="submit"
                  className="flex-2 py-3.5 bg-linear-to-r from-[#B5A65F] to-[#8E803F] rounded-xl text-black font-bold uppercase tracking-wider shadow-[0_5px_15px_rgba(181,166,95,0.2)] hover:shadow-[0_8px_25px_rgba(181,166,95,0.3)] hover:-translate-y-0.5 transition-all"
                >
                  {isEditMode ? "Lưu Thay Đổi" : "Tạo Hoạt Động"}
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
