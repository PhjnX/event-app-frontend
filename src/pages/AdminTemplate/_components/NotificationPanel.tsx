import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminNotifications,
  fetchOrganizerNotifications, 
  markAsRead,
  markAllAsRead,
} from "@/store/slices/notificationSlice";
import type { AppDispatch, RootState } from "@/store";
import { ROLES } from "@/constants";
import { toast } from "react-toastify";

type NotificationData = {
  unlockReason?: string;
  reason?: string;
  eventId?: string;
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

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const loadNotifications = () => {
    if (isSAdmin) {
      dispatch(fetchAdminNotifications());
    } else if (isOrganizer) {
      dispatch(fetchOrganizerNotifications());
    }
  };

  useEffect(() => {
    loadNotifications(); 
    const interval = setInterval(loadNotifications, 30000); 
    return () => clearInterval(interval);
  }, [dispatch, isSAdmin, isOrganizer]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
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

  const handleNotificationClick = (notification: any) => {
    dispatch(markAsRead(notification.id));

    switch (notification.type) {
      case "ORGANIZER_PENDING":
      case "UNLOCK_REQUEST":
        navigate("/admin/organizers");
        break;
      case "EVENT_PENDING":
        navigate("/admin/events");
        break;
      case "NEW_REGISTRATION":
        if (notification.data?.eventId) {
          navigate(`/admin/events/${notification.data.eventId}/registrations`);
        }
        break;
      case "EVENT_APPROVED":
      case "EVENT_REJECTED":
        if (notification.data?.slug) {
          navigate(`/admin/events/${notification.data.slug}`);
        } else {
          navigate("/admin/events");
        }
        break;
    }
    setIsOpen(false);
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

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
          <div className="flex items-center justify-between p-4 border-b border-zinc-700 bg-zinc-800/50">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#D8C97B]" />
              Thông báo
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllAsRead())}
                  className="text-xs text-[#D8C97B] hover:text-[#f0e68c] flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-white/5"
                >
                  <CheckCheck className="w-3 h-3" />
                  Đọc tất cả
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {isLoading && items.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 flex flex-col items-center">
                <div className="w-6 h-6 border-2 border-[#D8C97B] border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-xs">Đang tải...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
                <Bell className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Không có thông báo mới</p>
              </div>
            ) : (
              (items as Notification[]).map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-3 p-4 cursor-pointer border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors ${
                    !notification.read ? "bg-[#D8C97B]/5" : ""
                  }`}
                >
                  <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white mb-1">
                      {notification.title}
                    </p>

                    <p
                      className="text-sm text-gray-400 leading-relaxed"
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        display: "block",
                      }}
                    >
                      {notification.message}
                    </p>

                    {notification.type === "UNLOCK_REQUEST" &&
                      (notification.data?.unlockReason ||
                        notification.data?.reason) && (
                        <div
                          className="text-xs text-[#D8C97B] mt-2 italic bg-[#D8C97B]/10 p-2 rounded border border-[#D8C97B]/20"
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            display: "block",
                          }}
                        >
                          "
                          {notification.data.unlockReason ||
                            notification.data.reason}
                          "
                        </div>
                      )}

                    <p className="text-[10px] text-zinc-500 mt-2 font-mono">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>

                  {!notification.read && (
                    <div className="w-2 h-2 bg-[#D8C97B] rounded-full shrink-0 mt-2 shadow-[0_0_8px_rgba(216,201,123,0.5)]" />
                  )}
                </div>
              ))
            )}
          </div>

          {items.length > 5 && (
            <div className="p-3 border-t border-zinc-700 text-center bg-zinc-800/30">
              <button
                onClick={() => {
                  if (isSAdmin) navigate("/admin/notifications");
                  else toast.info("Tính năng xem tất cả đang phát triển");
                  setIsOpen(false);
                }}
                className="text-xs font-bold text-[#D8C97B] hover:text-[#f0e68c] uppercase tracking-wider"
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
