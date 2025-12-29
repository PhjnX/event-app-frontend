import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaCheck,
  FaTimes,
  FaTrash,
  FaEye,
  FaPaperPlane,
  FaSearch,
  FaEdit,
  FaMapMarkerAlt,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaBolt,
  FaExclamationCircle,
  FaUsers, 
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton, Tooltip } from "antd";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchAllEvents,
  fetchMyEvents,
  deleteEvent,
  approveEvent,
  rejectEvent,
  updateEvent,
  fetchFeaturedEvents,
  fetchSelectedEvents,
  updateFeaturedEvents,
  updateSelectedEvents,
} from "../../../store/slices/eventSlice";
import { ROLES } from "@/constants";
import ConfirmModal from "./../_components/ConfirmModal";

const ITEMS_PER_PAGE = 8;

export default function ManageEvents() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, featuredEvents, selectedEvents, isLoading } = useSelector(
    (state: RootState) => state.events
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const isSAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === "SADMIN";

  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "DELETE" | "APPROVE" | "REJECT" | "SEND" | null;
    data: any | null;
  }>({ isOpen: false, type: null, data: null });
  const [rejectionReason, setRejectionReason] = useState("");

  const isEventExpired = (endDate: string) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  useEffect(() => {
    if (isSAdmin) {
      dispatch(fetchAllEvents());
      dispatch(fetchFeaturedEvents());
      dispatch(fetchSelectedEvents());
    } else {
      dispatch(fetchMyEvents());
    }
  }, [dispatch, isSAdmin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const filteredAndSortedData = useMemo(() => {
    let result = data.filter((event) => {
      if (isSAdmin && event.status === "DRAFT") return false;

      if (activeTab === "ALL") return true;
      if (activeTab === "HAPPENING")
        return event.status === "PUBLISHED" && !isEventExpired(event.endDate);
      if (activeTab === "ENDED")
        return event.status === "PUBLISHED" && isEventExpired(event.endDate);

      return event.status === activeTab;
    });

    if (searchTerm) {
      result = result.filter((e) =>
        e.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result.sort((a, b) => {
      const getPriorityScore = (event: any) => {
        const expired = isEventExpired(event.endDate);
        if (event.status === "PENDING_APPROVAL") return 1;
        if (event.status === "PUBLISHED" && !expired) return 2;
        if (event.status === "PUBLISHED" && expired) return 3;
        if (event.status === "REJECTED") return 4;
        return 5;
      };
      const scoreA = getPriorityScore(a);
      const scoreB = getPriorityScore(b);
      return scoreA !== scoreB ? scoreA - scoreB : b.eventId - a.eventId;
    });
  }, [data, activeTab, searchTerm, isSAdmin]);

  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedData, currentPage]);

  const handleToggleHero = async (event: any) => {
    if (!isSAdmin) return;
    const currentIds = featuredEvents.map((e) => e.eventId);
    const isActive = currentIds.includes(event.eventId);
    let newIds = isActive
      ? currentIds.filter((id) => id !== event.eventId)
      : [...currentIds, event.eventId];
    if (!isActive && currentIds.length >= 4)
      return toast.warning("Tối đa 4 sự kiện!");

    isActive
      ? toast.info(`Đã gỡ khỏi Hero Banner`)
      : toast.success(`Đã thêm vào Hero Banner`);
    await dispatch(updateFeaturedEvents(newIds));
  };

  const handleToggleSelected = async (event: any) => {
    if (!isSAdmin) return;
    const currentIds = selectedEvents.map((e) => e.eventId);
    const isActive = currentIds.includes(event.eventId);
    let newIds = isActive
      ? currentIds.filter((id) => id !== event.eventId)
      : [...currentIds, event.eventId];
    if (!isActive && currentIds.length >= 8)
      return toast.warning("Tối đa 8 sự kiện!");

    isActive
      ? toast.info(`Đã gỡ khỏi Nổi bật`)
      : toast.success(`Đã thêm vào Nổi bật`);
    await dispatch(updateSelectedEvents(newIds));
  };

  const handleConfirmAction = async () => {
    const { type, data } = confirmModal;
    if (!data) return;
    try {
      if (type === "DELETE") {
        await dispatch(deleteEvent(data.slug)).unwrap();
        toast.success("Đã xóa sự kiện!");
      } else if (type === "APPROVE") {
        await dispatch(approveEvent(data.eventId)).unwrap();
        toast.success("Đã duyệt sự kiện!");
      } else if (type === "REJECT") {
        if (!rejectionReason.trim()) {
          toast.warning("Nhập lý do từ chối!");
          return;
        }
        await dispatch(
          rejectEvent({ eventId: data.eventId, reason: rejectionReason })
        ).unwrap();
        toast.success("Đã từ chối!");
        setRejectionReason("");
      } else if (type === "SEND") {
        await dispatch(
          updateEvent({
            slug: data.slug,
            data: { ...data, status: "PENDING_APPROVAL" },
          })
        ).unwrap();
        toast.success("Đã gửi yêu cầu!");
      }
    } catch (error: any) {
      toast.error(error || "Lỗi");
    } finally {
      setConfirmModal({ isOpen: false, type: null, data: null });
    }
  };

  const openModal = (type: any, eventItem: any) => {
    if (type === "REJECT") setRejectionReason("");
    setConfirmModal({ isOpen: true, type, data: eventItem });
  };

  const StatusBadge = ({
    status,
    endDate,
  }: {
    status: string;
    endDate: string;
  }) => {
    const expired = isEventExpired(endDate);
    if (status === "PUBLISHED" && expired)
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold border bg-gray-600 text-white border-gray-500">
          KẾT THÚC
        </span>
      );
    if (status === "PUBLISHED" && !expired)
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold border bg-green-500/20 text-green-400 border-green-500/30">
          ĐANG DIỄN RA
        </span>
      );

    let classes = "bg-gray-500/10 text-gray-400 border-gray-500/20";
    if (status === "PENDING_APPROVAL")
      classes = "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (status === "REJECTED")
      classes = "bg-red-500/20 text-red-400 border-red-500/30";
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-bold border ${classes}`}
      >
        {status === "PENDING_APPROVAL"
          ? "CHỜ DUYỆT"
          : status === "REJECTED"
          ? "TỪ CHỐI"
          : status}
      </span>
    );
  };

  const TABS = [
    { id: "ALL", label: "Tất cả" },
    { id: "PENDING_APPROVAL", label: "Chờ duyệt" },
    { id: "HAPPENING", label: "Đang diễn ra" },
    { id: "ENDED", label: "Đã kết thúc" },
    { id: "REJECTED", label: "Đã từ chối" },
    { id: "DRAFT", label: "Bản nháp" },
  ];
  const visibleTabs = isSAdmin ? TABS.filter((t) => t.id !== "DRAFT") : TABS;

  return (
    <div className="min-h-screen pb-20 font-sans text-white">
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-8 pt-4">
        <div className="w-full xl:w-auto overflow-x-auto custom-scrollbar">
          <div className="flex gap-1 p-1 bg-[#1a1a1a] border border-white/10 rounded-full w-max">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-[#B5A65F] text-black shadow-lg shadow-[#B5A65F]/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative group w-full sm:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F] transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-full pl-10 pr-4 py-3 text-sm text-white focus:border-[#B5A65F] focus:ring-1 focus:ring-[#B5A65F] outline-none transition-all placeholder-gray-600"
            />
          </div>
          {!isSAdmin && (
            <Link
              to="/admin/events/create"
              className="px-6 py-3 bg-[#B5A65F] text-black font-bold text-sm rounded-full flex items-center gap-2 hover:bg-[#c9ba6e] transition-all shadow-lg whitespace-nowrap"
            >
              <FaPlus /> Tạo mới
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
        {isLoading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[400px]"
              >
                <Skeleton.Image
                  active
                  className="w-full! h-64! opacity-20"
                  style={{ width: "100%", height: "256px" }}
                />
                <div className="p-6 flex-1 flex flex-col gap-4">
                  <Skeleton
                    active
                    title={{ width: "80%" }}
                    paragraph={{ rows: 2 }}
                  />
                </div>
              </div>
            ))}
          </>
        ) : (
          <AnimatePresence mode="popLayout">
            {paginatedData.map((event) => {
              const isHero = featuredEvents.some(
                (e) => e.eventId === event.eventId
              );
              const isSelected = selectedEvents.some(
                (e) => e.eventId === event.eventId
              );
              const isExpired = isEventExpired(event.endDate);
              const canDelete =
                event.status === "DRAFT" ||
                event.status === "REJECTED" ||
                isExpired;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={event.eventId}
                  className={`group relative flex flex-col bg-[#1a1a1a] rounded-3xl border overflow-hidden transition-all ${
                    isHero
                      ? "border-[#FFD700]/40 shadow-[0_0_15px_rgba(255,215,0,0.1)]"
                      : isSelected
                      ? "border-blue-500/30"
                      : "border-white/5 hover:border-[#B5A65F]/30"
                  }`}
                >
              
                  <div className="relative h-64 w-full bg-black">
                    <img
                      src={event.bannerImageUrl}
                      alt={event.eventName}
                      className={`w-full h-full object-cover transition-all ${
                        isExpired
                          ? "grayscale opacity-40"
                          : "opacity-80 group-hover:opacity-100"
                      }`}
                    />
                    <div className="absolute top-4 right-4 z-10">
                      <StatusBadge
                        status={event.status}
                        endDate={event.endDate}
                      />
                    </div>
                    {isSAdmin && !isExpired && (
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-1 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
                        <button
                          onClick={() => handleToggleHero(event)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isHero
                              ? "bg-[#FFD700] text-black scale-110"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          <FaStar size={14} />
                        </button>
                        <div className="w-px h-4 bg-white/20"></div>
                        <button
                          onClick={() => handleToggleSelected(event)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-blue-500 text-white scale-110"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          <FaBolt size={14} />
                        </button>
                      </div>
                    )}
                  </div>

            
                  <div className="flex-1 px-8 pt-2 pb-6 flex flex-col gap-3 relative z-10 -mt-16">
                    <h3
                      className={`text-2xl font-bold line-clamp-2 min-h-16 ${
                        isExpired ? "text-gray-500" : "text-white"
                      }`}
                    >
                      {event.eventName}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-400 bg-[#1a1a1a]/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-[#B5A65F]" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaClock className="text-[#B5A65F]" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                    {event.status === "REJECTED" && event.reason && (
                      <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start animate-pulse">
                        <FaExclamationCircle className="text-red-500 mt-0.5 shrink-0 text-lg" />
                        <div className="text-xs text-red-400">
                          <span className="font-bold block mb-1">
                            Lý do từ chối:
                          </span>
                          {event.reason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex items-center justify-between gap-2">
                    <Link
                      to={`/admin/events/${event.slug}`}
                      className="text-xs font-bold text-gray-400 hover:text-white flex gap-2"
                    >
                      <FaEye /> CHI TIẾT
                    </Link>
                    <div className="flex items-center gap-2">
                      {isSAdmin &&
                        event.status === "PENDING_APPROVAL" &&
                        !isExpired && (
                          <>
                            <button
                              onClick={() => openModal("APPROVE", event)}
                              className="w-9 h-9 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white flex items-center justify-center"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => openModal("REJECT", event)}
                              className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                      {!isSAdmin && !isExpired && (
                        <>
                     
                          {(event.status === "PUBLISHED" ||
                            event.status === "APPROVED") && (
                            <Tooltip title="Quản lý người tham gia">
                              <Link
                                to={`/admin/events/${event.eventId}/registrations`}
                                className="w-9 h-9 rounded-xl bg-[#B5A65F]/10 text-[#B5A65F] hover:bg-[#B5A65F] hover:text-black flex items-center justify-center"
                              >
                                <FaUsers />
                              </Link>
                            </Tooltip>
                          )}

                          {(event.status === "DRAFT" ||
                            event.status === "REJECTED") && (
                            <>
                              <Link
                                to={`/admin/events/${event.slug}/edit`}
                                className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center"
                              >
                                <FaEdit />
                              </Link>
                              <button
                                onClick={() => openModal("SEND", event)}
                                className="w-9 h-9 rounded-xl bg-[#B5A65F]/10 text-[#B5A65F] hover:bg-[#B5A65F] hover:text-black flex items-center justify-center"
                              >
                                <FaPaperPlane />
                              </button>
                            </>
                          )}
                        </>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => openModal("DELETE", event)}
                          className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

   
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-white/10 disabled:opacity-50"
          >
            <FaChevronLeft />
          </button>
          <span className="text-sm">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-white/10 disabled:opacity-50"
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      {confirmModal.isOpen && confirmModal.type === "REJECT" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              Từ chối sự kiện
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Vui lòng nhập lý do từ chối.
            </p>
            <textarea
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-red-500 outline-none resize-none h-32"
              placeholder="Nhập lý do..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() =>
                  setConfirmModal({ ...confirmModal, isOpen: false })
                }
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-6 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600"
              >
                Xác nhận
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={handleConfirmAction}
          type={confirmModal.type === "DELETE" ? "DELETE" : "APPROVE"}
          title="Xác nhận"
          message={
            confirmModal.type === "APPROVE"
              ? `Duyệt sự kiện này?`
              : confirmModal.type === "SEND"
              ? "Gửi yêu cầu duyệt?"
              : "Xóa sự kiện này?"
          }
          confirmText="Đồng ý"
        />
      )}
    </div>
  );
}
