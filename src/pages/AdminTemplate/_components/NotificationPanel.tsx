import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  CheckCheck,
  X,
  User,
  Calendar,
  Unlock,
  UserPlus,
  CheckCircle,
  XCircle,
  Lock,
  ChevronDown,
  Maximize2,
  FileEdit,
  AlertCircle,
} from "lucide-react";
import { useCheckNavigate as useNavigate } from "@/utils/i18n-router";
import {
  fetchAdminNotifications,
  fetchOrganizerNotifications,
  markAsRead,
  markAllAsRead,
} from "@/store/slices/notificationSlice";
import type { AppDispatch, RootState } from "@/store";
import { ROLES } from "@/constants";
import { motion, AnimatePresence } from "framer-motion";

type NotificationData = {
  unlockReason?: string;
  unlockRequestReason?: string;
  reason?: string;
  rejectionReason?: string;
  editRequestReason?: string;
  eventId?: string;
  organizerId?: string;
  slug?: string;
  [key: string]: any;
};

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: NotificationData;
};

const ACTION_TYPES = [
  "ORGANIZER_PENDING",
  "UNLOCK_REQUEST",
  "EVENT_PENDING",
  "EDIT_REQUEST_PENDING",
];

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTION" | "INFO">("ALL");

  const panelRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { items, unreadCount, isLoading } = useSelector(
    (state: RootState) => state.notifications,
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const isSAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === "SADMIN";
  const isOrganizer =
    user?.role === ROLES.ORGANIZER || user?.role === "ORGANIZER";

  useEffect(() => {
    const loadData = () => {
      if (isSAdmin) dispatch(fetchAdminNotifications());
      else if (isOrganizer) dispatch(fetchOrganizerNotifications());
    };
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [dispatch, isSAdmin, isOrganizer]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setVisibleCount(5), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    if (activeTab === "ACTION") {
      result = result.filter((n) => ACTION_TYPES.includes(n.type));
    } else if (activeTab === "INFO") {
      result = result.filter((n) => !ACTION_TYPES.includes(n.type));
    }
    return result;
  }, [items, activeTab]);

  const displayedItemsDropdown = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount],
  );
  const hasMoreDropdown = visibleCount < filteredItems.length;

  const handleNotificationClick = (notification: Notification) => {
    dispatch(markAsRead(notification.id));
    const data = notification.data || {};

    switch (notification.type) {
      case "EDIT_REQUEST_PENDING":
        navigate(`/admin/events/${data.slug || data.eventId}`);
        break;
      case "EDIT_REQUEST_REJECTED":
        navigate(`/admin/events/${data.slug || data.eventId}`);
        break;
      case "ORGANIZER_PENDING":
        if (data.organizerId)
          navigate(
            `/admin/organizers?status=PENDING&highlight=${data.organizerId}`,
          );
        else navigate("/admin/organizers?status=PENDING");
        break;
      case "UNLOCK_REQUEST":
        if (data.organizerId)
          navigate(
            `/admin/organizers?unlockRequest=true&highlight=${data.organizerId}`,
          );
        else navigate("/admin/organizers");
        break;
      case "EVENT_PENDING":
        if (data.eventId)
          navigate(
            `/admin/events?status=PENDING_APPROVAL&highlight=${data.eventId}`,
          );
        else navigate("/admin/events?status=PENDING_APPROVAL");
        break;
      case "NEW_REGISTRATION":
        if (data.eventId)
          navigate(`/admin/events/${data.eventId}/registrations`);
        break;
      case "EVENT_APPROVED":
      case "EVENT_REJECTED":
        if (data.eventId)
          navigate(
            notification.type === "EVENT_REJECTED"
              ? `/admin/events?status=REJECTED&highlight=${data.eventId}`
              : `/admin/events`,
          );
        break;
      case "ACCOUNT_LOCKED":
        navigate("/admin/profile");
        break;
    }
    setIsOpen(false);
    setShowAllModal(false);
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSeconds < 60) return "Vừa xong";
    const minutes = Math.floor(diffSeconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "EDIT_REQUEST_PENDING":
        return <FileEdit className="w-5 h-5 text-yellow-500" />;
      case "EDIT_REQUEST_REJECTED":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "ORGANIZER_PENDING":
        return <User className="w-5 h-5 text-blue-400" />;
      case "EVENT_PENDING":
        return <Calendar className="w-5 h-5 text-purple-400" />;
      case "UNLOCK_REQUEST":
        return <Unlock className="w-5 h-5 text-orange-400" />;
      case "NEW_REGISTRATION":
        return <UserPlus className="w-5 h-5 text-green-400" />;
      case "EVENT_APPROVED":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "EVENT_REJECTED":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "ACCOUNT_LOCKED":
        return <Lock className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getReasonText = (notification: Notification) => {
    const data = notification.data || {};
    return (
      data.rejectionReason ||
      data.reason ||
      data.editRequestReason ||
      data.unlockReason ||
      data.unlockRequestReason
    );
  };

  const NotificationItem = ({
    notification,
  }: {
    notification: Notification;
  }) => {
    const reasonContent = getReasonText(notification);
    const hasReason = reasonContent && reasonContent.trim() !== "";
    const showReasonBox =
      notification.type === "UNLOCK_REQUEST" ||
      notification.type === "EVENT_REJECTED" ||
      notification.type === "EDIT_REQUEST_PENDING" ||
      notification.type === "EDIT_REQUEST_REJECTED";
    const isErrorType = notification.type.includes("REJECTED");

    return (
      <div
        onClick={() => handleNotificationClick(notification)}
        className={`flex items-start gap-3 p-4 cursor-pointer border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors ${
          !notification.read ? "bg-[#D8C97B]/5" : ""
        }`}
      >
        <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <p
              className={`text-sm mb-1 ${!notification.read ? "font-bold text-white" : "font-medium text-gray-300"}`}
            >
              {notification.title}
            </p>
            <span className="text-[10px] text-zinc-500 font-mono shrink-0 whitespace-nowrap pt-0.5">
              {formatTime(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed wrap-break-word whitespace-pre-wrap">
            {notification.message}
          </p>

          {hasReason && showReasonBox && (
            <div
              className={`text-xs mt-2 italic p-2 rounded border border-dashed ${
                isErrorType
                  ? "text-red-400 bg-red-500/10 border-red-500/30"
                  : "text-[#D8C97B] bg-[#D8C97B]/10 border-[#D8C97B]/20"
              }`}
            >
              {(isErrorType ||
                notification.type === "EDIT_REQUEST_PENDING") && (
                <span className="font-bold not-italic text-[10px] uppercase opacity-80 mr-1">
                  Lý do:
                </span>
              )}
              "{reasonContent}"
            </div>
          )}
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-[#D8C97B] rounded-full shrink-0 mt-2 shadow-[0_0_8px_rgba(216,201,123,0.5)]" />
        )}
      </div>
    );
  };

  const TabButtons = () => (
    <div className="flex px-4 gap-5 mt-2 border-b border-zinc-700/50">
      {[
        { id: "ALL", label: "Tất cả" },
        { id: "ACTION", label: "Cần xử lý" },
        { id: "INFO", label: "Hệ thống" },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id as any);
            setVisibleCount(5);
          }}
          className={`pb-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === tab.id
              ? "border-[#D8C97B] text-[#D8C97B]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors"
      >
        <Bell className="w-6 h-6 text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 animate-bounce">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col bg-zinc-800/50 pt-4">
            <div className="flex items-center justify-between px-4 pb-1">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#D8C97B]" /> Thông báo (
                {items.length})
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllAsRead())}
                  className="text-xs text-[#D8C97B] hover:text-[#f0e68c] flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-white/5"
                >
                  <CheckCheck className="w-3 h-3" /> Đọc hết
                </button>
              )}
            </div>
            <TabButtons />
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {isLoading && items.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 flex flex-col items-center">
                <div className="w-6 h-6 border-2 border-[#D8C97B] border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-xs">Đang tải...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
                <Bell className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Không có thông báo nào trong mục này</p>
              </div>
            ) : (
              <>
                {displayedItemsDropdown.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification as Notification}
                  />
                ))}
                {hasMoreDropdown && (
                  <div className="p-2 text-center bg-zinc-900 sticky bottom-0 border-t border-zinc-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setVisibleCount((prev) => prev + 5);
                      }}
                      className="text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 px-4 py-2 rounded-full transition-all flex items-center justify-center gap-1 mx-auto w-full"
                    >
                      <ChevronDown size={14} /> Tải thêm
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          {filteredItems.length > 5 && (
            <div className="p-3 border-t border-zinc-700 text-center bg-zinc-800/30">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowAllModal(true);
                }}
                className="text-xs font-bold text-[#D8C97B] hover:text-[#f0e68c] uppercase tracking-wider flex items-center justify-center gap-2 w-full"
              >
                <Maximize2 size={12} /> Xem tất cả
              </button>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showAllModal && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex flex-col border-b border-zinc-700 bg-zinc-800 pt-5">
                <div className="flex items-center justify-between px-5 pb-2">
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <Bell className="text-[#D8C97B]" /> Tất cả thông báo{" "}
                    <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </h2>
                  <div className="flex gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => dispatch(markAllAsRead())}
                        className="text-sm font-bold text-[#D8C97B] hover:text-[#f0e68c] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#D8C97B]/10 hover:bg-[#D8C97B]/20 transition-colors"
                      >
                        <CheckCheck size={16} /> Đánh dấu đã đọc hết
                      </button>
                    )}
                    <button
                      onClick={() => setShowAllModal(false)}
                      className="p-2 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <div className="px-1">
                  <TabButtons />
                </div>
              </div>

              <div className="overflow-y-auto custom-scrollbar flex-1 bg-zinc-900/95">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                    <Bell className="w-16 h-16 mb-4 opacity-20" />
                    <p>Không có thông báo nào trong mục này</p>
                  </div>
                ) : (
                  filteredItems.map((notification) => (
                    <NotificationItem
                      key={`modal-${notification.id}`}
                      notification={notification as Notification}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
