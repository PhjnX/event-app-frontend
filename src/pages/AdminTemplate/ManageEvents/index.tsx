import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPlus,
  FaCheck,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import type { AppDispatch, RootState } from "../../../store";
import {
  fetchAllEvents,
  fetchMyEvents,
  deleteEvent,
  approveEvent,
  rejectEvent,
} from "../../../store/slices/eventSlice";
import { ROLES } from "@/constants";
import LoadingScreen from "@/pages/HomeTemplate/_components/common/LoadingSrceen";
import type { Event } from "../../../models/event";

export default function ManageEvents() {
  const dispatch = useDispatch<AppDispatch>();

  const { data, isLoading } = useSelector((state: RootState) => state.events);
  const { user } = useSelector((state: RootState) => state.auth);

  const isSAdmin = user?.role === ROLES.SUPER_ADMIN;

  useEffect(() => {
    if (isSAdmin) dispatch(fetchAllEvents());
    else dispatch(fetchMyEvents());
  }, [dispatch, isSAdmin]);

  const handleDelete = (slug: string) => {
    if (window.confirm("Xóa sự kiện này?")) dispatch(deleteEvent(slug));
  };

  if (isLoading && data.length === 0) return <LoadingScreen />;

  return (
    <div className="space-y-8 text-white font-sans">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">
            Quản lý <span className="text-[#B5A65F]">Sự Kiện</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Danh sách sự kiện {isSAdmin ? "trên toàn hệ thống" : "của bạn"}.
          </p>
        </div>
        {!isSAdmin && (
          <button className="px-6 py-3 bg-[#B5A65F] text-black font-bold rounded-xl hover:bg-[#d4c376] transition-colors flex items-center gap-2 shadow-lg shadow-[#B5A65F]/20">
            <FaPlus /> Tạo Sự Kiện
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.map((event: Event) => (
          <motion.div
            key={event.eventId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-[#1a1a1a]/60 border border-white/10 rounded-3xl overflow-hidden hover:border-[#B5A65F]/50 transition-all hover:shadow-2xl flex flex-col"
          >
            <div className="h-48 w-full relative overflow-hidden">
              <img
                src={
                  event.bannerImageUrl || "https://via.placeholder.com/400x200"
                }
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt="banner"
              />
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border backdrop-blur-md
                        ${
                          event.status === "APPROVED"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : event.status === "REJECTED"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }`}
                >
                  {event.status}
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-[#B5A65F] transition-colors">
                {event.eventName}
              </h3>
              <div className="space-y-2 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-[#B5A65F]" />{" "}
                  {new Date(event.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#B5A65F]" /> {event.location}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/10 flex gap-3">
                <Link
                  to={`/admin/events/${event.slug}`}
                  state={{ eventId: event.eventId }}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-center rounded-lg text-sm font-bold transition-colors"
                >
                  Chi tiết
                </Link>

                {isSAdmin && event.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => dispatch(approveEvent(event.eventId))}
                      className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500 hover:text-black transition-colors"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => dispatch(rejectEvent(event.eventId))}
                      className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </>
                )}
                {!isSAdmin && (
                  <button
                    onClick={() => handleDelete(event.slug)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
