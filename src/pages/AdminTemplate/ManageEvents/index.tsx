import { useEffect, useState, useMemo, useRef } from "react";
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
  FaFileExcel,
  FaSpinner,
  FaLock,
  FaCalendarAlt,
  FaRegStar,
  FaHourglassHalf,
  FaFilter,
  FaChevronDown,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchAllEvents,
  fetchMyEvents,
  deleteEvent,
  approveEvent,
  rejectEvent,
  submitEventForApproval,
  fetchFeaturedEvents,
  fetchSelectedEvents,
  updateFeaturedEvents,
  updateSelectedEvents,
} from "../../../store/slices/eventSlice";

import { fetchOrganizerDetail } from "../../../store/slices/organizerSlice";
import { ROLES } from "@/constants";
import ConfirmModal from "../_components/ConfirmModal";
import OptimizedImage from "@/components/ui/OptimizedImage";

const ITEMS_PER_PAGE = 8;

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse bg-linear-to-r from-gray-800 via-gray-700 to-gray-800 bg-size-[200%_100%] rounded-3xl ${className}`}
    style={{
      animation: "shimmer 1. 5s infinite",
    }}
  />
);

const Tooltip = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
    setIsVisible(true);
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap z-50 border border-white/10"
          >
            {title}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="border-4 border-transparent border-t-gray-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============== MAIN COMPONENT ==============

export default function ManageEvents() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, featuredEvents, selectedEvents, isLoading } = useSelector(
    (state: RootState) => state.events,
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const isSAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === "SADMIN";

  const [orgStatus, setOrgStatus] = useState({ locked: false, approved: true });
  const [isChecking, setIsChecking] = useState(user?.role === "ORGANIZER");

  useEffect(() => {
    if (user?.role === "ORGANIZER") {
      setIsChecking(true);
      const orgData = (user as any).organizer || {};
      if (
        typeof orgData.locked === "boolean" ||
        typeof orgData.approved === "boolean"
      ) {
        setOrgStatus({
          locked: orgData.locked === true,
          approved: orgData.approved !== false,
        });
      }

      const slugToCheck =
        orgData.slug ||
        (user as any).organizerSlug ||
        (user as any).organizer?.slug;

      if (slugToCheck) {
        dispatch(fetchOrganizerDetail(slugToCheck))
          .then((res: any) => {
            if (res.payload) {
              setOrgStatus({
                locked: res.payload.locked === true,
                approved: res.payload.approved === true,
              });
            }
          })
          .finally(() => setIsChecking(false));
      } else {
        setIsChecking(false);
      }
    }
  }, [dispatch, user]);

  const isRestricted = !isSAdmin && (orgStatus.locked || !orgStatus.approved);

  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const [tempHeroState, setTempHeroState] = useState<Record<number, boolean>>(
    {},
  );
  const [tempSelectedState, setTempSelectedState] = useState<
    Record<number, boolean>
  >({});

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "DELETE" | "APPROVE" | "REJECT" | "SEND" | null;
    data: any | null;
  }>({ isOpen: false, type: null, data: null });
  const [rejectionReason, setRejectionReason] = useState("");

  const checkTimeStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now > end) return "ENDED";
    if (now < start) return "UPCOMING";
    return "HAPPENING";
  };

  // --- CLICK OUTSIDE DROPDOWN ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // --- FILTER LOGIC ---
  const filteredAndSortedData = useMemo(() => {
    let result = data.filter((event) => {
      if (isSAdmin && event.status === "DRAFT") return false;

      if (activeTab === "ALL") return true;
      if (activeTab === "APPROVED") {
        return event.status === "PUBLISHED" || event.status === "APPROVED";
      }
      return event.status === activeTab;
    });

    if (searchTerm) {
      result = result.filter((e) =>
        e.eventName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return result.sort((a, b) => {
      const getPriorityScore = (event: any) => {
        if (event.status === "REJECTED") return 1;
        if (event.status === "PENDING_APPROVAL") return 2;
        const timeStatus = checkTimeStatus(event.startDate, event.endDate);
        if (event.status === "PUBLISHED") {
          if (timeStatus === "HAPPENING") return 3;
          if (timeStatus === "UPCOMING") return 4;
          if (timeStatus === "ENDED") return 6;
        }
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
    const isCurrentlyHero = tempHeroState.hasOwnProperty(event.eventId)
      ? tempHeroState[event.eventId]
      : featuredEvents.some((e) => e.eventId === event.eventId);
    const nextState = !isCurrentlyHero;
    if (
      nextState &&
      featuredEvents.length >= 4 &&
      !tempHeroState[event.eventId]
    ) {
      toast.warning("Tối đa 4 sự kiện Hero Banner!");
      return;
    }
    setTempHeroState((prev) => ({ ...prev, [event.eventId]: nextState }));
    try {
      const currentIds = featuredEvents.map((e) => e.eventId);
      let newIds = [];
      if (nextState) {
        newIds = [...currentIds, event.eventId];
      } else {
        newIds = currentIds.filter((id) => id !== event.eventId);
      }
      await dispatch(updateFeaturedEvents(newIds)).unwrap();
      dispatch(fetchFeaturedEvents());
      if (nextState) toast.success("Đã thêm vào Hero Banner");
      else toast.info("Đã gỡ khỏi Hero Banner");
    } catch (error) {
      toast.error("Lỗi cập nhật!");
      setTempHeroState((prev) => ({
        ...prev,
        [event.eventId]: isCurrentlyHero,
      }));
    }
  };

  const handleToggleSelected = async (event: any) => {
    if (!isSAdmin) return;
    const isCurrentlySelected = tempSelectedState.hasOwnProperty(event.eventId)
      ? tempSelectedState[event.eventId]
      : selectedEvents.some((e) => e.eventId === event.eventId);
    const nextState = !isCurrentlySelected;
    if (
      nextState &&
      selectedEvents.length >= 8 &&
      !tempSelectedState[event.eventId]
    ) {
      toast.warning("Tối đa 8 sự kiện Nổi bật!");
      return;
    }
    setTempSelectedState((prev) => ({ ...prev, [event.eventId]: nextState }));
    try {
      const currentIds = selectedEvents.map((e) => e.eventId);
      let newIds = [];
      if (nextState) {
        newIds = [...currentIds, event.eventId];
      } else {
        newIds = currentIds.filter((id) => id !== event.eventId);
      }
      await dispatch(updateSelectedEvents(newIds)).unwrap();
      dispatch(fetchSelectedEvents());
      if (nextState) toast.success("Đã thêm vào Nổi bật");
      else toast.info("Đã gỡ khỏi Nổi bật");
    } catch (error) {
      toast.error("Lỗi cập nhật!");
      setTempSelectedState((prev) => ({
        ...prev,
        [event.eventId]: isCurrentlySelected,
      }));
    }
  };

  const handleExportExcel = async () => {
    if (filteredAndSortedData.length === 0) {
      toast.warn("Không có dữ liệu để xuất!");
      return;
    }
    setIsExporting(true);
    try {
      const dataToExport = filteredAndSortedData.map((event) => ({
        "ID Sự kiện": event.eventId,
        "Tên sự kiện": event.eventName,
        "Trạng thái": event.status,
        "Địa điểm": event.location,
        "Ngày bắt đầu": new Date(event.startDate).toLocaleDateString("vi-VN"),
        "Giờ bắt đầu": new Date(event.startDate).toLocaleTimeString("vi-VN"),
        "Ngày kết thúc": new Date(event.endDate).toLocaleDateString("vi-VN"),
        "Người tổ chức": event.organizerName || "N/A",
        "Số lượng vé": event.totalTickets || 0,
        "Lý do từ chối": event.reason || "",
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const wscols = [
        { wch: 10 },
        { wch: 30 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 10 },
        { wch: 15 },
        { wch: 20 },
      ];
      worksheet["!cols"] = wscols;
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách sự kiện");
      XLSX.writeFile(
        workbook,
        `Danh_sach_su_kien_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      toast.success("Xuất file Excel thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xuất file Excel.");
    } finally {
      setIsExporting(false);
    }
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
          rejectEvent({ eventId: data.eventId, reason: rejectionReason }),
        ).unwrap();
        toast.success("Đã từ chối!");
        setRejectionReason("");
      } else if (type === "SEND") {
        await dispatch(submitEventForApproval(data.slug)).unwrap();
        toast.success("Đã gửi yêu cầu duyệt!");
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
    startDate,
    endDate,
  }: {
    status: string;
    startDate: string;
    endDate: string;
  }) => {
    const timeStatus = checkTimeStatus(startDate, endDate);
    if (status === "PENDING_APPROVAL")
      return (
        <span className="px-3 py-1 rounded-lg text-[10px] font-black border bg-blue-500/10 text-blue-400 border-blue-500/30 flex items-center gap-1.5">
          <FaHourglassHalf className="animate-pulse" /> ĐANG CHỜ DUYỆT
        </span>
      );
    if (status === "REJECTED")
      return (
        <span className="px-3 py-1 rounded-lg text-[10px] font-black border bg-red-500/10 text-red-400 border-red-500/30 flex items-center gap-1.5">
          <FaExclamationCircle /> TỪ CHỐI
        </span>
      );
    if (status === "DRAFT")
      return (
        <span className="px-3 py-1 rounded-lg text-[10px] font-black border bg-gray-500/10 text-gray-400 border-gray-500/30">
          BẢN NHÁP
        </span>
      );
    if (status === "PUBLISHED" || status === "APPROVED") {
      if (timeStatus === "ENDED")
        return (
          <span className="px-3 py-1 rounded-lg text-[10px] font-black border bg-gray-700 text-gray-300 border-gray-600">
            ĐÃ KẾT THÚC
          </span>
        );
      if (timeStatus === "UPCOMING")
        return (
          <span className="px-3 py-1 rounded-lg text-[10px] font-black border bg-yellow-500/10 text-yellow-500 border-yellow-500/30 flex items-center gap-1">
            <FaClock /> SẮP DIỄN RA
          </span>
        );
      return (
        <span className="px-3 py-1 rounded-lg text-[10px] font-black border bg-green-500/10 text-green-400 border-green-500/30 flex items-center gap-1">
          <span className="w-1. 5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
          ĐANG DIỄN RA
        </span>
      );
    }
    return null;
  };

  const TABS = [
    { id: "ALL", label: "Tất cả trạng thái" },
    { id: "DRAFT", label: "Bản nháp" },
    { id: "PENDING_APPROVAL", label: "Chờ duyệt" },
    { id: "APPROVED", label: "Đã công bố" },
    { id: "REJECTED", label: "Bị từ chối" },
  ];
  const visibleTabs = isSAdmin ? TABS.filter((t) => t.id !== "DRAFT") : TABS;

  return (
    <div className="min-h-screen pb-20 font-noto text-white">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8 pt-4">
        <div className="w-full sm:w-auto relative z-30" ref={filterDropdownRef}>
          <div
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="cursor-pointer flex items-center justify-between gap-4 w-full sm:min-w-[260px] px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 hover:border-[#B5A65F]/50 transition-all shadow-lg group"
          >
            <div className="flex items-center gap-3">
              <FaFilter className="text-[#B5A65F] shrink-0" />
              <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                {visibleTabs.find((t) => t.id === activeTab)?.label}
              </span>
            </div>
            <FaChevronDown
              className={`text-gray-500 transition-transform duration-300 ${
                isFilterDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          <AnimatePresence>
            {isFilterDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {visibleTabs.map((tab) => (
                  <div
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsFilterDropdownOpen(false);
                    }}
                    className="px-4 py-3 hover:bg-white/5 cursor-pointer flex justify-between items-center text-sm border-b border-white/5 last:border-0 transition-colors"
                  >
                    <span
                      className={
                        activeTab === tab.id
                          ? "text-[#B5A65F] font-bold"
                          : "text-gray-400"
                      }
                    >
                      {tab.label}
                    </span>
                    {activeTab === tab.id && (
                      <FaCheck className="text-[#B5A65F] text-xs" />
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all font-bold text-sm whitespace-nowrap shadow-lg ${
              isExporting
                ? "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                : "bg-green-600/20 text-green-500 border-green-600/30 hover:bg-green-600 hover:text-white"
            }`}
          >
            {isExporting ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaFileExcel />
            )}{" "}
            {isExporting ? "Đang tạo..." : "Xuất Excel"}
          </button>

          <div className="relative group w-full sm:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F] transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none transition-all placeholder-gray-600"
            />
          </div>

          {!isSAdmin &&
            (isChecking ? (
              <div className="px-6 py-3 bg-[#1a1a1a] border border-white/10 text-gray-400 font-bold text-sm rounded-2xl flex items-center gap-2 cursor-wait">
                <FaSpinner className="animate-spin" /> Check...
              </div>
            ) : isRestricted ? (
              <div
                className="px-4 py-3 bg-red-500/10 text-red-500 font-bold text-sm rounded-2xl flex items-center gap-2 border border-red-500/20 cursor-not-allowed opacity-80"
                title="Bị khóa"
              >
                <FaLock /> Bị hạn chế
              </div>
            ) : (
              <Link
                to="/admin/events/create"
                className="px-6 py-3 bg-[#B5A65F] text-black font-bold text-sm rounded-2xl flex items-center gap-2 hover:bg-[#c9ba6e] transition-all shadow-lg whitespace-nowrap"
              >
                <FaPlus /> Tạo mới
              </Link>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/5"
              >
                <Skeleton className="w-full h-64" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-8 w-3/4 rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <div className="flex justify-between pt-4">
                    <Skeleton className="h-6 w-20 rounded-lg" />
                    <Skeleton className="h-9 w-32 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <AnimatePresence mode="popLayout">
            {paginatedData.map((event) => {
              const isHero = tempHeroState.hasOwnProperty(event.eventId)
                ? tempHeroState[event.eventId]
                : featuredEvents.some((e) => e.eventId === event.eventId);
              const isSelected = tempSelectedState.hasOwnProperty(event.eventId)
                ? tempSelectedState[event.eventId]
                : selectedEvents.some((e) => e.eventId === event.eventId);
              const timeStatus = checkTimeStatus(
                event.startDate,
                event.endDate,
              );
              const isExpired = timeStatus === "ENDED";
              const canDelete =
                event.status === "DRAFT" ||
                event.status === "REJECTED" ||
                isExpired;

              let borderClass = "border-white/5 hover:border-[#B5A65F]/30";
              if (isHero)
                borderClass =
                  "border-[#FFD700]/40 shadow-[0_0_15px_rgba(255,215,0,0.1)]";
              else if (isSelected) borderClass = "border-blue-500/30";
              else if (event.status === "REJECTED")
                borderClass =
                  "border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
              else if (event.status === "PENDING_APPROVAL")
                borderClass =
                  "border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]";

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={event.eventId}
                  className={`group relative flex flex-col bg-[#1a1a1a] rounded-3xl border overflow-hidden transition-all ${borderClass}`}
                >
                  <div className="relative h-64 w-full bg-black">
                    <OptimizedImage
                      src={event.bannerImageUrl}
                      alt={event.eventName}
                      width={600}
                      height={256}
                      className="w-full h-full"
                      imgClassName={`transition-all ${
                        isExpired
                          ? "grayscale opacity-40"
                          : "opacity-80 group-hover:opacity-100"
                      }`}
                    />
                    <div className="absolute top-4 right-4 z-10">
                      <StatusBadge
                        status={event.status}
                        startDate={event.startDate}
                        endDate={event.endDate}
                      />
                    </div>
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
                        <FaMapMarkerAlt className="text-[#B5A65F]" />{" "}
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-[#B5A65F]" />{" "}
                        <span>
                          {new Date(event.startDate).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                    </div>

                    {event.status === "REJECTED" && (
                      <div className="mt-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 items-start animate-pulse">
                        <FaExclamationCircle className="text-red-500 mt-0.5 shrink-0 text-lg" />
                        <div className="text-xs text-red-400">
                          <span className="font-bold block mb-1 uppercase tracking-wide">
                            Yêu cầu bị từ chối
                          </span>
                          <span className="text-gray-300">Lý do: </span>
                          {event.reason || "Vi phạm chính sách cộng đồng. "}
                        </div>
                      </div>
                    )}

                    {event.status === "PENDING_APPROVAL" && (
                      <div className="mt-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex gap-3 items-center">
                        <div className="shrink-0">
                          {isSAdmin ? (
                            <FaExclamationCircle className="text-blue-400 text-lg animate-pulse" />
                          ) : (
                            <FaHourglassHalf className="text-blue-400 animate-spin-slow text-lg" />
                          )}
                        </div>
                        <div className="text-xs text-blue-300">
                          <span className="font-bold block mb-1 uppercase tracking-wide">
                            {isSAdmin
                              ? "Yêu cầu phê duyệt"
                              : "Đang chờ phê duyệt"}
                          </span>
                          {isSAdmin
                            ? "Sự kiện này đang chờ bạn kiểm duyệt.  Vui lòng kiểm tra."
                            : "Sự kiện đang được Admin xem xét. Vui lòng chờ."}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex items-center justify-between gap-2">
                    <Link
                      to={`/admin/events/${event.slug}`}
                      className="text-xs font-bold text-gray-400 hover:text-white flex gap-2"
                    >
                      <FaEye /> CHI TIẾT
                    </Link>
                    <div className="flex items-center gap-2">
                      {isSAdmin && !isExpired && (
                        <>
                          <Tooltip title="Hero Banner">
                            <button
                              onClick={() => handleToggleHero(event)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                                isHero
                                  ? "bg-[#FFD700] text-black border-[#FFD700]"
                                  : "bg-gray-800 text-gray-500 border-transparent hover:text-[#FFD700]"
                              }`}
                            >
                              {isHero ? (
                                <FaStar size={14} />
                              ) : (
                                <FaRegStar size={14} />
                              )}
                            </button>
                          </Tooltip>
                          <Tooltip title="Nổi bật">
                            <button
                              onClick={() => handleToggleSelected(event)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                                isSelected
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : "bg-gray-800 text-gray-500 border-transparent hover:text-blue-400"
                              }`}
                            >
                              <FaBolt size={14} />
                            </button>
                          </Tooltip>
                          <div className="w-px h-4 bg-white/10 mx-1"></div>
                        </>
                      )}
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
                          {!isChecking &&
                            !isRestricted &&
                            (event.status === "DRAFT" ||
                              event.status === "REJECTED") && (
                              <>
                                <Link
                                  to={`/admin/events/${event.slug}/edit`}
                                  className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center"
                                  title="Sửa"
                                >
                                  <FaEdit />
                                </Link>
                                <button
                                  onClick={() => openModal("SEND", event)}
                                  className="w-9 h-9 rounded-xl bg-[#B5A65F]/10 text-[#B5A65F] hover:bg-[#B5A65F] hover:text-black flex items-center justify-center"
                                  title="Gửi duyệt"
                                >
                                  <FaPaperPlane />
                                </button>
                              </>
                            )}
                        </>
                      )}
                      {!isChecking && !isRestricted && canDelete && (
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

      {/* --- PAGINATION & MODALS --- */}
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
                ? "Bạn có chắc chắn muốn gửi yêu cầu duyệt sự kiện này?"
                : "Xóa sự kiện này?"
          }
          confirmText="Đồng ý"
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
