import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "@/utils/i18n-router";
import { useSearchParams } from "react-router-dom";
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
  FaCalendarAlt,
  FaRegStar,
  FaHourglassHalf,
  FaFilter,
  FaChevronDown,
  FaUnlockAlt,
  FaBan,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

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
  approveEditRequest,
  rejectEditRequest,
} from "../../../store/slices/eventSlice";

import { ROLES } from "@/constants";
import ConfirmModal from "../_components/ConfirmModal";
import OptimizedImage from "@/components/ui/OptimizedImage";

const ITEMS_PER_PAGE = 8;

const Tooltip = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap z-50 border border-white/10"
          >
            {title}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ManageEvents() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const statusParam = searchParams.get("status");

  const { data, featuredEvents, selectedEvents, isLoading } = useSelector(
    (state: RootState) => state.events,
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const isSAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === "SADMIN";

  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);

  const [tempHeroState, setTempHeroState] = useState<Record<number, boolean>>(
    {},
  );
  const [tempSelectedState, setTempSelectedState] = useState<
    Record<number, boolean>
  >({});

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type:
      | "DELETE"
      | "APPROVE"
      | "REJECT"
      | "SEND"
      | "APPROVE_EDIT"
      | "REJECT_EDIT"
      | null;
    data: any | null;
  }>({ isOpen: false, type: null, data: null });

  const [rejectionReason, setRejectionReason] = useState("");

  const checkTimeStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    if (now > new Date(endDate)) return "ENDED";
    if (now < new Date(startDate)) return "UPCOMING";
    return "HAPPENING";
  };

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
    const fetchData = () => {
      if (isSAdmin) {
        dispatch(fetchAllEvents());
        dispatch(fetchFeaturedEvents());
        dispatch(fetchSelectedEvents());
      } else {
        dispatch(fetchMyEvents());
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [dispatch, isSAdmin]);

  // Logic Highlight & Auto Tab
  useEffect(() => {
    if (highlightId && data.length > 0) {
      const target = data.find((e) => String(e.eventId) === highlightId);
      if (target) {
        const requestStatus = (target as any).editRequestStatus;
        if (isSAdmin && requestStatus === "PENDING") {
          setActiveTab("EDIT_REQUEST");
        } else if (statusParam) {
          setActiveTab(
            statusParam === "PENDING_APPROVAL"
              ? "PENDING_APPROVAL"
              : statusParam === "REJECTED"
                ? "REJECTED"
                : "ALL",
          );
        } else {
          if (target.status === "PENDING_APPROVAL")
            setActiveTab("PENDING_APPROVAL");
          else if (target.status === "REJECTED") setActiveTab("REJECTED");
          else if (target.status === "DRAFT") setActiveTab("DRAFT");
          else setActiveTab("ALL");
        }
        setTimeout(
          () =>
            highlightedRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            }),
          500,
        );
      }
    }
  }, [highlightId, statusParam, data, isSAdmin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // --- FILTER & SORT ---
  const filteredAndSortedData = useMemo(() => {
    let result = data.filter((event) => {
      if (activeTab === "ALL")
        return isSAdmin ? event.status !== "DRAFT" : true;
      if (activeTab === "EDIT_REQUEST")
        return (event as any).editRequestStatus === "PENDING";
      if (activeTab === "APPROVED")
        return event.status === "PUBLISHED" || event.status === "APPROVED";
      return event.status === activeTab;
    });

    if (searchTerm) {
      result = result.filter((e) =>
        e.eventName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return result.sort((a, b) => {
      if (String(a.eventId) === highlightId) return -1;
      if (String(b.eventId) === highlightId) return 1;

      const getPriorityScore = (event: any) => {
        if ((event as any).editRequestStatus === "PENDING") return 0;
        if (event.status === "PENDING_APPROVAL") return 1;
        const timeStatus = checkTimeStatus(event.startDate, event.endDate);
        if (event.status === "PUBLISHED" || event.status === "APPROVED") {
          if (timeStatus === "HAPPENING") return 2;
          if (timeStatus === "UPCOMING") return 3;
          if (timeStatus === "ENDED") return 5;
        }
        if (event.status === "DRAFT") return 4;
        if (event.status === "REJECTED") return 6;
        return 7;
      };
      return getPriorityScore(a) - getPriorityScore(b) || b.eventId - a.eventId;
    });
  }, [data, activeTab, searchTerm, isSAdmin, highlightId]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);

  // --- ACTIONS ---
  const handleToggleState = async (event: any, isHero: boolean) => {
    if (
      !isSAdmin ||
      checkTimeStatus(event.startDate, event.endDate) === "ENDED"
    ) {
      toast.error("Không thể thay đổi trạng thái!");
      return;
    }
    const currentState = isHero
      ? (tempHeroState[event.eventId] ??
        featuredEvents.some((e) => e.eventId === event.eventId))
      : (tempSelectedState[event.eventId] ??
        selectedEvents.some((e) => e.eventId === event.eventId));

    const nextState = !currentState;
    const setState = isHero ? setTempHeroState : setTempSelectedState;
    setState((prev) => ({ ...prev, [event.eventId]: nextState }));

    try {
      const collection = isHero ? featuredEvents : selectedEvents;
      const validEvents = collection.filter(
        (e) => checkTimeStatus(e.startDate, e.endDate) !== "ENDED",
      );
      let newIds = validEvents.map((e) => e.eventId);
      if (nextState) newIds = [...newIds, event.eventId];
      else newIds = newIds.filter((id) => id !== event.eventId);

      const action = isHero ? updateFeaturedEvents : updateSelectedEvents;
      const fetchAction = isHero ? fetchFeaturedEvents : fetchSelectedEvents;

      await dispatch(action([...new Set(newIds)])).unwrap();
      dispatch(fetchAction());
      toast.success(
        nextState
          ? `Đã thêm vào ${isHero ? "Hero" : "Nổi bật"}`
          : `Đã gỡ khỏi ${isHero ? "Hero" : "Nổi bật"}`,
      );
    } catch {
      toast.error("Lỗi cập nhật");
      setState((prev) => ({ ...prev, [event.eventId]: currentState }));
    }
  };

  const handleConfirmAction = async () => {
    const { type, data } = confirmModal;
    if (!data) return;
    try {
      const actions: any = {
        DELETE: () => dispatch(deleteEvent(data.slug)).unwrap(),
        APPROVE: () => dispatch(approveEvent(data.eventId)).unwrap(),
        REJECT: () =>
          dispatch(
            rejectEvent({ eventId: data.eventId, reason: rejectionReason }),
          ).unwrap(),
        SEND: () => dispatch(submitEventForApproval(data.slug)).unwrap(),
        APPROVE_EDIT: () => dispatch(approveEditRequest(data.eventId)).unwrap(),
        REJECT_EDIT: () =>
          dispatch(
            rejectEditRequest({
              eventId: data.eventId,
              reason: rejectionReason,
            }),
          ).unwrap(),
      };

      if (actions[type!]) {
        if (
          (type === "REJECT" || type === "REJECT_EDIT") &&
          !rejectionReason.trim()
        ) {
          toast.warning("Nhập lý do!");
          return;
        }
        await actions[type!]();
        toast.success("Thành công!");
        if (type?.includes("EDIT")) dispatch(fetchAllEvents());
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi xử lý");
    } finally {
      setConfirmModal({ isOpen: false, type: null, data: null });
      setRejectionReason("");
    }
  };

  const openModal = (type: any, eventItem: any) => {
    if (type?.includes("REJECT")) setRejectionReason("");
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
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
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
  if (isSAdmin) TABS.splice(1, 0, { id: "EDIT_REQUEST", label: "Yêu cầu sửa" });
  const visibleTabs = isSAdmin ? TABS.filter((t) => t.id !== "DRAFT") : TABS;

  return (
    <div className="min-h-screen pb-20 font-noto text-white">
      {/* HEADER FILTER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8 pt-4">
        {/* Dropdown Tabs */}
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
              className={`text-gray-500 transition-transform duration-300 ${isFilterDropdownOpen ? "rotate-180" : ""}`}
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

        {/* Search & New */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
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
          {!isSAdmin && (
            <Link
              to="/admin/events/create"
              className="px-6 py-3 bg-[#B5A65F] text-black font-bold text-sm rounded-2xl flex items-center gap-2 hover:bg-[#c9ba6e] transition-all shadow-lg whitespace-nowrap"
            >
              <FaPlus /> Tạo mới
            </Link>
          )}
        </div>
      </div>

      {/* LIST EVENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
        {isLoading ? (
          <div className="text-gray-500 col-span-2 text-center py-20">
            Đang tải dữ liệu...
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {paginatedData.map((event) => {
              const isHighlighted = String(event.eventId) === highlightId;
              const editStatus = (event as any).editRequestStatus;
              const hasEditRequest = editStatus === "PENDING";

              const isHero =
                tempHeroState[event.eventId] ??
                featuredEvents.some((e) => e.eventId === event.eventId);
              const isSelected =
                tempSelectedState[event.eventId] ??
                selectedEvents.some((e) => e.eventId === event.eventId);
              const isExpired =
                checkTimeStatus(event.startDate, event.endDate) === "ENDED";

              let borderClass = "border-white/5 hover:border-[#B5A65F]/30";
              if (isHighlighted)
                borderClass =
                  "border-[#B5A65F] ring-2 ring-[#B5A65F]/30 shadow-[0_0_25px_rgba(181,166,95,0.4)] z-10 scale-[1.02]";
              else if (hasEditRequest && isSAdmin)
                borderClass =
                  "border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.2)]";
              else if (event.status === "PENDING_APPROVAL")
                borderClass =
                  "border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]";

              return (
                <motion.div
                  ref={isHighlighted ? highlightedRef : null}
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
                      imgClassName={`transition-all ${isExpired ? "grayscale opacity-40" : "opacity-80 group-hover:opacity-100"}`}
                    />
                    <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                      <StatusBadge
                        status={event.status}
                        startDate={event.startDate}
                        endDate={event.endDate}
                      />
                      {hasEditRequest && (
                        <span className="px-3 py-1 text-[10px] font-black border bg-yellow-500/10 text-yellow-500 border-yellow-500/30 animate-pulse flex items-center gap-1">
                          <FaUnlockAlt /> YÊU CẦU SỬA
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 px-8 pt-2 pb-6 flex flex-col gap-3 relative z-10 -mt-16">
                    <h3
                      className={`text-2xl font-bold line-clamp-2 min-h-16 ${isExpired ? "text-gray-500" : "text-white"}`}
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
                  </div>

                  <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex items-center justify-between gap-2">
                    <Link
                      to={`/admin/events/${event.slug}`}
                      className="text-xs font-bold text-gray-400 hover:text-white flex gap-2"
                    >
                      <FaEye /> CHI TIẾT
                    </Link>
                    <div className="flex items-center gap-2">
                      {isSAdmin ? (
                        <>
                          {hasEditRequest &&
                          event.editRequestStatus === "PENDING" ? (
                            <>
                              <Tooltip title="Duyệt yêu cầu sửa">
                                <button
                                  onClick={() =>
                                    openModal("APPROVE_EDIT", event)
                                  }
                                  className="w-9 h-9 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white flex items-center justify-center animate-pulse"
                                >
                                  <FaUnlockAlt />
                                </button>
                              </Tooltip>
                              <Tooltip title="Từ chối yêu cầu">
                                <button
                                  onClick={() =>
                                    openModal("REJECT_EDIT", event)
                                  }
                                  className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center"
                                >
                                  <FaBan />
                                </button>
                              </Tooltip>
                              <div className="w-px h-4 bg-white/10 mx-1"></div>
                            </>
                          ) : (
                            <>
                              <Tooltip
                                title={
                                  isExpired && !isHero
                                    ? "Đã kết thúc"
                                    : "Hero Banner"
                                }
                              >
                                <button
                                  onClick={() => handleToggleState(event, true)}
                                  disabled={isExpired && !isHero}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${isHero ? "bg-[#FFD700] text-black border-[#FFD700]" : "bg-gray-800 text-gray-500 border-transparent hover:text-[#FFD700]"}`}
                                >
                                  {isHero ? (
                                    <FaStar size={14} />
                                  ) : (
                                    <FaRegStar size={14} />
                                  )}
                                </button>
                              </Tooltip>
                              <Tooltip
                                title={
                                  isExpired && !isSelected
                                    ? "Đã kết thúc"
                                    : "Nổi bật"
                                }
                              >
                                <button
                                  onClick={() =>
                                    handleToggleState(event, false)
                                  }
                                  disabled={isExpired && !isSelected}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${isSelected ? "bg-blue-500 text-white border-blue-500" : "bg-gray-800 text-gray-500 border-transparent hover:text-blue-400"}`}
                                >
                                  {isSelected ? (
                                    <FaBolt size={14} />
                                  ) : (
                                    <FaBolt size={14} className="opacity-30" />
                                  )}
                                </button>
                              </Tooltip>
                            </>
                          )}
                          {event.status === "PENDING_APPROVAL" &&
                            !isExpired && (
                              <>
                                <div className="w-px h-4 bg-white/10 mx-1"></div>
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
                        </>
                      ) : (
                        !isExpired && (
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
                                <button
                                  onClick={() => openModal("DELETE", event)}
                                  className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center"
                                  title="Xóa"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}
                          </>
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* PAGINATION & MODALS */}
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

      {confirmModal.isOpen && confirmModal.type?.includes("REJECT") ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              {confirmModal.type === "REJECT_EDIT"
                ? "Từ chối yêu cầu sửa"
                : "Từ chối sự kiện"}
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
              : confirmModal.type === "APPROVE_EDIT"
                ? `Chấp nhận yêu cầu chỉnh sửa? Sự kiện sẽ được mở khóa để Organizer sửa.`
                : confirmModal.type === "SEND"
                  ? "Gửi yêu cầu duyệt?"
                  : "Xóa sự kiện?"
          }
          confirmText="Đồng ý"
        />
      )}
    </div>
  );
}
