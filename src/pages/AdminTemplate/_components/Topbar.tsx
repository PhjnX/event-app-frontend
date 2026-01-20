import React, { useEffect, useState, useRef } from "react";
import {
  FaSignOutAlt,
  FaHome,
  FaChevronRight,
  FaLock,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Bell, CheckCheck, X, User, Calendar, Unlock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { logoutUser } from "@/store/slices/auth";
import {
  requestUnlockOrganizer,
  fetchOrganizerDetail,
  fetchOrganizers,
} from "@/store/slices/organizerSlice";
import { fetchAllEvents } from "@/store/slices/eventSlice";
import type { AppDispatch, RootState } from "@/store";
import { ROLES } from "@/constants";

import ConfirmModal from "./ConfirmModal";

interface Notification {
  id: string;
  type: "ORGANIZER_PENDING" | "EVENT_PENDING" | "UNLOCK_REQUEST";
  title: string;
  message: string;
  data: any;
  createdAt: string;
  read: boolean;
}

interface TopbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Topbar: React.FC<TopbarProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const isSAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === "SADMIN";
  const isOrganizer =
    user?.role === ROLES.ORGANIZER || user?.role === "ORGANIZER";

  const [orgStatus, setOrgStatus] = useState({
    locked: false,
    approved: true,
    unlockRequested: false,
  });

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean }>({
    isOpen: false,
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const notifPanelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!isSAdmin) return;

    setIsNotifLoading(true);
    try {
      const [orgRes, eventRes] = await Promise.all([
        dispatch(fetchOrganizers()).unwrap(),
        dispatch(fetchAllEvents()).unwrap(),
      ]);

      const notifList: Notification[] = [];

      const pendingOrganizers = (orgRes || []).filter(
        (o: any) => o.approved === false,
      );
      pendingOrganizers.forEach((org: any) => {
        notifList.push({
          id: `org-${org.organizerId}`,
          type: "ORGANIZER_PENDING",
          title: "Yêu cầu đăng ký Organizer",
          message: `${org.organizerName || org.name || "Organizer"} đang chờ duyệt`,
          data: org,
          createdAt: org.createdAt || new Date().toISOString(),
          read: false,
        });
      });

      const unlockRequests = (orgRes || []).filter(
        (o: any) => o.unlockRequested === true,
      );
      unlockRequests.forEach((org: any) => {
        notifList.push({
          id: `unlock-${org.organizerId}`,
          type: "UNLOCK_REQUEST",
          title: "Yêu cầu mở khóa tài khoản",
          message: `${org.organizerName || org.name || "Organizer"} yêu cầu mở khóa`,
          data: org,
          createdAt: org.updatedAt || new Date().toISOString(),
          read: false,
        });
      });

      const pendingEvents = (eventRes || []).filter(
        (e: any) => e.status === "PENDING_APPROVAL",
      );
      pendingEvents.forEach((event: any) => {
        notifList.push({
          id: `event-${event.eventId}`,
          type: "EVENT_PENDING",
          title: "Sự kiện chờ duyệt",
          message: `"${event.eventName || "Sự kiện"}" đang chờ phê duyệt`,
          data: event,
          createdAt: event.createdAt || new Date().toISOString(),
          read: false,
        });
      });

      notifList.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setNotifications(notifList);
      setUnreadCount(notifList.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setIsNotifLoading(false);
    }
  };

  useEffect(() => {
    if (isSAdmin) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isSAdmin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifPanelRef.current &&
        !notifPanelRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotifIcon = (type: string) => {
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

  const handleNotificationClick = (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    switch (notification.type) {
      case "ORGANIZER_PENDING":
      case "UNLOCK_REQUEST":
        navigate("/admin/organizers");
        break;
      case "EVENT_PENDING":
        navigate("/admin/events");
        break;
    }
    setIsNotifOpen(false);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
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

  useEffect(() => {
    if (isOrganizer && user) {
      const orgData = (user as any).organizer;
      const slugToCheck = orgData?.slug;

      if (slugToCheck) {
        dispatch(fetchOrganizerDetail(slugToCheck)).then((res: any) => {
          if (res.payload) {
            setOrgStatus({
              locked: res.payload.locked === true,
              approved: res.payload.approved === true,
              unlockRequested: res.payload.unlockRequested === true,
            });
          }
        });
      }
    }
  }, [dispatch, isOrganizer, user]);

  const isRestricted = !isSAdmin && (orgStatus.locked || !orgStatus.approved);

  const handleRequestClick = () => {
    if (!orgStatus.approved) {
      toast.info("Tài khoản của bạn đang chờ Admin phê duyệt hồ sơ.");
      return;
    }
    if (orgStatus.unlockRequested) {
      toast.info("Yêu cầu mở khóa đang được xử lý.  Vui lòng chờ.");
      return;
    }
    setConfirmModal({ isOpen: true });
  };

  const handleConfirmUnlock = async () => {
    try {
      await dispatch(requestUnlockOrganizer()).unwrap();
      toast.success("Đã gửi yêu cầu mở khóa!");
      setOrgStatus((prev) => ({ ...prev, unlockRequested: true }));
    } catch (error) {
      toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại sau.");
    } finally {
      setConfirmModal({ isOpen: false });
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/auth");
  };

  const getPageTitle = (path: string) => {
    if (path.includes("/admin/events")) return "Manage Events";
    if (path.includes("/admin/presenters")) return "Manage Guest Speakers";
    if (path.includes("/admin/organizers")) return "Manage Organizers";
    if (path.includes("/admin/users")) return "Manage Users";
    if (path.includes("/admin/news")) return "Manage News";
    return "Dashboard";
  };
  const currentTitle = getPageTitle(location.pathname);

  return (
    <>
      <header className="h-16 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#D8C97B]/20 flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300">
        <div className="flex items-center gap-2 text-sm">
          {currentTitle !== "Dashboard" ? (
            <>
              <Link
                to="/admin"
                className="text-gray-500 hover:text-[#D8C97B] transition-colors flex items-center gap-1 font-medium"
              >
                <FaHome className="mt-0.5" /> Dashboard
              </Link>
              <FaChevronRight className="text-gray-700 text-xs" />
              <span className="text-white font-bold tracking-wide">
                {currentTitle}
              </span>
            </>
          ) : (
            <span className="text-white font-bold tracking-wide flex items-center gap-2">
              <FaHome className="mt-0.5 text-[#D8C97B]" /> Dashboard
            </span>
          )}
        </div>

        <div className="flex items-center gap-6">
          {isRestricted && (
            <button
              onClick={handleRequestClick}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border animate-fadeIn ${
                !orgStatus.approved
                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 cursor-default"
                  : orgStatus.unlockRequested
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20 cursor-default"
                    : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white cursor-pointer animate-pulse"
              }`}
              title={
                !orgStatus.approved
                  ? "Tài khoản chưa được duyệt"
                  : orgStatus.unlockRequested
                    ? "Đang chờ Admin xử lý"
                    : "Nhấn để yêu cầu mở khóa"
              }
            >
              {!orgStatus.approved ? (
                <>
                  <FaExclamationTriangle /> Chờ duyệt
                </>
              ) : orgStatus.unlockRequested ? (
                <>
                  <FaClock /> Đang chờ duyệt
                </>
              ) : (
                <>
                  <FaLock /> Bị khóa (Yêu cầu mở)
                </>
              )}
            </button>
          )}

          {isSAdmin && (
            <div className="relative" ref={notifPanelRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-400 hover:text-[#D8C97B] transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-[#111111] border border-[#D8C97B]/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#D8C97B]" />
                      Thông báo
                    </h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-[#D8C97B] hover:text-[#f0e68c] flex items-center gap-1 transition-colors"
                        >
                          <CheckCheck className="w-4 h-4" />
                          Đọc tất cả
                        </button>
                      )}
                      <button
                        onClick={() => setIsNotifOpen(false)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {isNotifLoading && notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <div className="w-6 h-6 border-2 border-[#D8C97B] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Đang tải...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Không có thông báo mới</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`flex items-start gap-3 p-4 cursor-pointer border-b border-white/5 hover:bg-white/5 transition-colors ${
                            !notification.read ? "bg-[#D8C97B]/5" : ""
                          }`}
                        >
                          <div className="shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            {getNotifIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>

                          {!notification.read && (
                            <div className="w-2 h-2 bg-[#D8C97B] rounded-full shrink-0 mt-2 animate-pulse" />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-white/10 text-center">
                      <button
                        onClick={() => {
                          navigate("/admin/notifications");
                          setIsNotifOpen(false);
                        }}
                        className="text-sm text-[#D8C97B] hover:text-[#f0e68c] transition-colors"
                      >
                        Xem tất cả thông báo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col items-end">
            <span className="text-[#D8C97B] font-black font-noto text-sm tracking-wider uppercase">
              {isSAdmin ? "SUPER ADMIN" : "ORGANIZER"}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              {user?.username}
            </span>
          </div>

          <div className="h-8 w-px bg-white/10"></div>

          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Đăng xuất"
          >
            <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform text-lg" />
          </button>
        </div>
      </header>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={handleConfirmUnlock}
        type="APPROVE"
        title="Yêu cầu mở khóa"
        message="Bạn có chắc muốn gửi yêu cầu mở khóa tài khoản đến Quản trị viên?"
        confirmText="Gửi yêu cầu"
      />
    </>
  );
};

export default Topbar;
