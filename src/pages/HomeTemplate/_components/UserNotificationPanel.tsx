import { useRef, useState, useEffect } from "react";
import {
  Bell,
  Check,
  Ticket,
  XCircle,
  CalendarClock,
  PartyPopper,
  Calendar,
  Newspaper,
  ListChecks,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import hook i18n
import {
  useUserNotifications,
  type UserNotification,
} from "@/hooks/useUserNotifications";

const UserNotificationPanel = () => {
  const { t, i18n } = useTranslation(); // Khởi tạo hook
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useUserNotifications();

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

  const handleClickItem = (item: UserNotification) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return t("user_notification_panel.time.just_now");
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t("user_notification_panel.time.just_now");

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return t("user_notification_panel.time.minutes_ago", {
        count: diffInMinutes,
      });
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return t("user_notification_panel.time.hours_ago", {
        count: diffInHours,
      });
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return t("user_notification_panel.time.days_ago", { count: diffInDays });
    }

    // Format ngày theo ngôn ngữ hiện tại
    return date.toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "REGISTRATION_APPROVED":
        return (
          <div className="p-2.5 rounded-full bg-linear-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <PartyPopper className="w-5 h-5 text-emerald-400" />
          </div>
        );
      case "REGISTRATION_REJECTED":
        return (
          <div className="p-2.5 rounded-full bg-linear-to-br from-red-500/20 to-pink-500/10 border border-red-500/30">
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
        );
      case "NEW_EVENT":
        return (
          <div className="p-2.5 rounded-full bg-linear-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/30">
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
        );
      case "NEW_POST":
        return (
          <div className="p-2.5 rounded-full bg-linear-to-br from-orange-500/20 to-yellow-500/10 border border-orange-500/30">
            <Newspaper className="w-5 h-5 text-orange-400" />
          </div>
        );
      default:
        return (
          <div className="p-2.5 rounded-full bg-linear-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30">
            <Ticket className="w-5 h-5 text-blue-400" />
          </div>
        );
    }
  };

  const renderActivityTags = (activityStr: string) => {
    if (!activityStr) return null;
    const activities = activityStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const displayed = activities.slice(0, 2);
    const remaining = activities.length - 2;

    return (
      <div className="mt-2 flex flex-col gap-1.5">
        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
          <ListChecks className="w-3 h-3" />
          {t("user_notification_panel.activity_label")}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {displayed.map((act, idx) => (
            <span
              key={idx}
              className="inline-block px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[11px] text-gray-300"
            >
              {act}
            </span>
          ))}
          {remaining > 0 && (
            <span className="inline-block px-2 py-0.5 rounded-md bg-[#D8C97B]/10 border border-[#D8C97B]/20 text-[11px] text-[#D8C97B]">
              {t("user_notification_panel.activity_others", {
                count: remaining,
              })}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative z-50" ref={panelRef}>
      {/* Button Chuông */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-full transition-all duration-300 group
          ${
            isOpen
              ? "bg-[#D8C97B]/20 text-[#D8C97B]"
              : "hover:bg-white/10 text-gray-300 hover:text-[#D8C97B]"
          }`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold h-5 min-w-5 px-1 flex items-center justify-center rounded-full border-2 border-[#0a0a0a] animate-pulse shadow-red-500/50 shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-4 w-[360px] md:w-[420px] 
          bg-[#121212]/95 backdrop-blur-xl border border-white/10 
          rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,1)] 
          overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
              {t("user_notification_panel.title")}
              {unreadCount > 0 && (
                <span className="text-[10px] bg-[#D8C97B] text-black px-2 py-0.5 rounded-full font-extrabold">
                  {t("user_notification_panel.new_badge", {
                    count: unreadCount,
                  })}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#D8C97B] hover:text-[#f0e68c] hover:underline flex items-center gap-1 transition-colors"
              >
                <Check className="w-3 h-3" />{" "}
                {t("user_notification_panel.mark_all_read")}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-16 px-6 text-center flex flex-col items-center justify-center text-gray-500">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <CalendarClock className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-sm font-medium text-gray-400">
                  {t("user_notification_panel.empty_state")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((item) => {
                  // Lấy chuỗi activities từ data (nếu có)
                  const activityStr = item.data?.activityListStr;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleClickItem(item)}
                      className={`
                        relative px-5 py-4 flex gap-4 cursor-pointer transition-all duration-200 border-b border-white/5
                        group hover:bg-white/8
                        ${!item.read ? "bg-[#D8C97B]/5" : "bg-transparent"}
                      `}
                    >
                      {!item.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D8C97B] shadow-[0_0_10px_#D8C97B]" />
                      )}

                      <div className="shrink-0 mt-1">
                        {renderIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p
                            className={`text-sm ${!item.read ? "font-bold text-white" : "font-medium text-gray-400"}`}
                          >
                            {item.title}
                          </p>
                          <span className="text-[10px] text-gray-600 ml-2 whitespace-nowrap mt-0.5">
                            {formatTime(item.time)}
                          </span>
                        </div>

                        <p
                          className={`text-xs leading-relaxed ${!item.read ? "text-gray-300" : "text-gray-500"}`}
                        >
                          {item.message}
                        </p>

                        {activityStr && renderActivityTags(activityStr)}
                      </div>

                      <div className="flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10 bg-[#151515] text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/my-tickets");
              }}
              className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors py-1 block w-full"
            >
              {t("user_notification_panel.view_all_tickets")}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default UserNotificationPanel;
