import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  CheckCheck,
  X,
  User,
  Calendar,
  Unlock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminNotifications,
  markAsRead,
  markAllAsRead,
} from "@/store/slices/notificationSlice";
import type { AppDispatch, RootState } from "@/store";

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { items, unreadCount, isLoading } = useSelector(
    (state: RootState) => state.notifications,
  );

  useEffect(() => {
    dispatch(fetchAdminNotifications());
    const interval = setInterval(() => {
      dispatch(fetchAdminNotifications());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

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
    }
    setIsOpen(false);
  };

  const formatTime = (dateString: string) => {
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
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <h3 className="font-semibold text-white">Thông báo</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllAsRead())}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                  Đọc tất cả
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading && items.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">Đang tải...</div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Không có thông báo mới</p>
              </div>
            ) : (
              items.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-3 p-4 cursor-pointer border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors ${
                    !notification.read ? "bg-zinc-800/30" : ""
                  }`}
                >
                  <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {notification.title}
                    </p>
                    <p className="text-sm text-zinc-400 truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>

                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-3 border-t border-zinc-700 text-center">
              <button
                onClick={() => {
                  navigate("/admin/notifications");
                  setIsOpen(false);
                }}
                className="text-sm text-blue-400 hover:text-blue-300"
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
