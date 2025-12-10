import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrashAlt, FaMapPin, FaUserTie } from "react-icons/fa";
import type { AppDispatch, RootState } from "../../../store";
import {
  fetchActivitiesByEvent,
  fetchActivityCategories,
  createActivity,
  deleteActivity,
} from "../../../store/slices/activitySlice";
import { fetchPresenters } from "../../../store/slices/presenterSlice";
import apiService from "../../../services/apiService";
import LoadingScreen from "@/pages/HomeTemplate/_components/common/LoadingSrceen";
import type { Event } from "../../../models/event";
import type { Activity, ActivityCategory } from "../../../models/activity"; 
import type { Presenter } from "../../../models/presenter"; 

export default function EventDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: activities, categories } = useSelector(
    (state: RootState) => state.activities
  );
  const { data: presenters } = useSelector(
    (state: RootState) => state.presenters
  );

  const [actForm, setActForm] = useState({
    activityName: "",
    description: "",
    startTime: "",
    endTime: "",
    roomOrVenue: "",
    categoryId: 0,
    presenterId: 0,
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
        console.error("Lỗi load event", error);
      } finally {
        setLoadingEvent(false);
      }
    };
    loadData();
  }, [slug, dispatch]);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    const payload = {
      ...actForm,
      eventId: event.eventId,
      presenterId: Number(actForm.presenterId),
      categoryId: Number(actForm.categoryId),
    };

    await dispatch(createActivity(payload));
    setIsModalOpen(false);
  };

  if (loadingEvent) return <LoadingScreen />;
  if (!event)
    return (
      <div className="text-white text-center pt-20">
        Không tìm thấy sự kiện!
      </div>
    );

  return (
    <div className="text-white font-sans relative pb-20">
      {/* BANNER */}
      <div className="h-[300px] w-full relative rounded-3xl overflow-hidden mb-8">
        <img
          src={event.bannerImageUrl}
          className="w-full h-full object-cover"
          alt="banner"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-black/40 to-transparent"></div>
        <div className="absolute bottom-8 left-8">
          <span className="px-3 py-1 bg-[#B5A65F] text-black text-xs font-bold uppercase rounded mb-2 inline-block">
            {event.status}
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-white drop-shadow-lg">
            {event.eventName}
          </h1>
          <p className="text-gray-300 mt-2 flex items-center gap-2">
            <FaMapPin className="text-[#B5A65F]" /> {event.location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INFO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-3xl">
            <h3 className="text-[#B5A65F] font-bold uppercase mb-4 text-sm tracking-widest border-b border-white/10 pb-2">
              Thông tin chung
            </h3>
            <p className="text-gray-400 text-sm mb-4">{event.description}</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Bắt đầu:</span>{" "}
                <span>{new Date(event.startDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kết thúc:</span>{" "}
                <span>{new Date(event.endDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Organizer:</span>{" "}
                <span className="text-[#B5A65F]">{event.organizerName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVITIES LIST */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold uppercase flex items-center gap-3">
              Lịch Trình <span className="text-[#B5A65F]">Chi Tiết</span>
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-[#B5A65F] hover:text-black border border-white/10 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
            >
              <FaPlus /> Thêm Hoạt Động
            </button>
          </div>

          <div className="space-y-4">
            {activities.length === 0 && (
              <p className="text-gray-500 italic">Chưa có hoạt động nào.</p>
            )}

            {/* Gán kiểu (act: Activity) để tránh lỗi any */}
            {activities.map((act: Activity) => (
              <motion.div
                key={act.activityId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 hover:border-[#B5A65F]/30 transition-all flex gap-4 group"
              >
                <div className="w-24 shrink-0 text-center border-r border-white/10 pr-4 flex flex-col justify-center">
                  <span className="text-xl font-bold text-white block">
                    {new Date(act.startTime).getHours()}:
                    {String(new Date(act.startTime).getMinutes()).padStart(
                      2,
                      "0"
                    )}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    đến {new Date(act.endTime).getHours()}:
                    {String(new Date(act.endTime).getMinutes()).padStart(
                      2,
                      "0"
                    )}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-[#B5A65F]">
                      {act.activityName}
                    </h4>
                    <button
                      onClick={() => dispatch(deleteActivity(act.activityId))}
                      className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                  <span className="text-[10px] uppercase bg-white/10 px-2 py-0.5 rounded text-gray-300 mt-1 inline-block mb-2">
                    {act.category?.categoryName || "General"}
                  </span>
                  <p className="text-sm text-gray-400 mb-3">
                    {act.description}
                  </p>

                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaMapPin /> {act.roomOrVenue}
                    </span>
                    {act.presenter && (
                      <span className="flex items-center gap-1 text-white">
                        <FaUserTie className="text-[#B5A65F]" />{" "}
                        {act.presenter.fullName}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#121212] border border-[#B5A65F]/30 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Thêm Hoạt Động Mới
              </h2>

              <form onSubmit={handleCreateActivity} className="space-y-4">
                <div>
                  <label className="text-xs text-[#B5A65F] uppercase font-bold">
                    Tên hoạt động
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#B5A65F] outline-none"
                    value={actForm.activityName}
                    onChange={(e) =>
                      setActForm({ ...actForm, activityName: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">
                      Bắt đầu
                    </label>
                    <input
                      required
                      type="datetime-local"
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm outline-none"
                      value={actForm.startTime}
                      onChange={(e) =>
                        setActForm({ ...actForm, startTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">
                      Kết thúc
                    </label>
                    <input
                      required
                      type="datetime-local"
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm outline-none"
                      value={actForm.endTime}
                      onChange={(e) =>
                        setActForm({ ...actForm, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase">
                    Phòng / Địa điểm
                  </label>
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none"
                    value={actForm.roomOrVenue}
                    onChange={(e) =>
                      setActForm({ ...actForm, roomOrVenue: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">
                      Danh mục
                    </label>
                    <select
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none"
                      value={actForm.categoryId}
                      onChange={(e) =>
                        setActForm({
                          ...actForm,
                          categoryId: Number(e.target.value),
                        })
                      }
                    >
                      <option value={0}>Chọn danh mục...</option>
                      {/* Gán kiểu (c: ActivityCategory) để tránh lỗi any */}
                      {categories.map((c: ActivityCategory) => (
                        <option key={c.categoryId} value={c.categoryId}>
                          {c.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">
                      Diễn giả
                    </label>
                    <select
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none"
                      value={actForm.presenterId}
                      onChange={(e) =>
                        setActForm({
                          ...actForm,
                          presenterId: Number(e.target.value),
                        })
                      }
                    >
                      <option value={0}>Chọn diễn giả...</option>
                      {/* Gán kiểu (p: Presenter) để tránh lỗi any */}
                      {presenters.map((p: Presenter) => (
                        <option key={p.presenterId} value={p.presenterId}>
                          {p.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase">
                    Mô tả
                  </label>
                  <textarea
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none h-24"
                    value={actForm.description}
                    onChange={(e) =>
                      setActForm({ ...actForm, description: e.target.value })
                    }
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 rounded-xl hover:bg-white/10 font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#B5A65F] text-black rounded-xl font-bold hover:bg-[#d4c376]"
                  >
                    Lưu Hoạt Động
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
