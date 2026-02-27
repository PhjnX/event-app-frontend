import React, { useEffect, useState } from "react";
import {
  FaSignOutAlt,
  FaHome,
  FaChevronRight,
  FaLock,
  FaClock,
  FaExclamationTriangle,
  FaGlobe,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { logoutUser } from "@/store/slices/auth";
import {
  requestUnlockOrganizer,
  fetchMyOrganizerStatus,
} from "@/store/slices/organizerSlice";

import type { AppDispatch, RootState } from "@/store";
import { ROLES } from "@/constants";

import NotificationPanel from "./NotificationPanel";
import ConfirmModal from "./ConfirmModal";

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

  const [prevOrgStatus, setPrevOrgStatus] = useState<typeof orgStatus | null>(
    null,
  );

  useEffect(() => {
    if (isOrganizer) {
      dispatch(fetchMyOrganizerStatus()).then((res: any) => {
        if (res.payload) {
          const freshStatus = {
            locked: res.payload.locked === true,
            approved: res.payload.approved === true,
            unlockRequested: res.payload.unlockRequested === true,
          };

          if (prevOrgStatus) {
            if (prevOrgStatus.locked && !freshStatus.locked) {
              toast.success("🎉 Tài khoản của bạn đã được mở khóa!");
            }
            if (!prevOrgStatus.approved && freshStatus.approved) {
              toast.success("🎉 Hồ sơ của bạn đã được phê duyệt!");
            }
          }

          setPrevOrgStatus(freshStatus);
          setOrgStatus(freshStatus);
        }
      });
    }
  }, [dispatch, isOrganizer, user]);

  const isRestricted = !isSAdmin && (orgStatus.locked || !orgStatus.approved);

  const handleRequestClick = () => {
    if (!orgStatus.approved) {
      toast.info("Tài khoản của bạn đang chờ Admin phê duyệt hồ sơ.");
      return;
    }
    if (orgStatus.unlockRequested) {
      toast.info("Yêu cầu mở khóa đang được xử lý. Vui lòng chờ.");
      return;
    }
    setConfirmModal({ isOpen: true });
  };

  const handleConfirmUnlock = async (reason?: string) => {
    try {
      await dispatch(requestUnlockOrganizer(reason || "")).unwrap();
      toast.success("Đã gửi yêu cầu mở khóa kèm lý do!");

      setOrgStatus((prev) => ({ ...prev, unlockRequested: true }));
      dispatch(fetchMyOrganizerStatus());
    } catch (error: any) {
      toast.error(
        error.message || "Gửi yêu cầu thất bại. Vui lòng thử lại sau.",
      );
    } finally {
      setConfirmModal({ isOpen: false });
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/auth");
  };

  const getPageTitle = (path: string) => {
    if (path.includes("/admin/events")) return "Quản lý Sự kiện";
    if (path.includes("/admin/presenters")) return "Quản lý Khách mời";
    if (path.includes("/admin/organizers")) return "Quản lý Tổ chức sự kiện";
    if (path.includes("/admin/users")) return "Quản lý Người dùng";
    if (path.includes("/admin/news")) return "Quản lý Tin tức";
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
                <FaHome className="mt-0.5" /> Trang chủ
              </Link>
              <FaChevronRight className="text-gray-700 text-xs" />
              <span className="text-white font-bold tracking-wide">
                {currentTitle}
              </span>
            </>
          ) : (
            <span className="text-white font-bold tracking-wide flex items-center gap-2">
              <FaHome className="mt-0.5 text-[#D8C97B]" /> Trang chủ
            </span>
          )}
        </div>

        <div className="flex items-center gap-6">
          {isOrganizer && (
            <Link
              to="/"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-gray-400 text-xs font-bold hover:text-[#D8C97B] hover:border-[#D8C97B]/50 hover:bg-[#D8C97B]/10 transition-all"
              title="Quay về trang chủ website"
            >
              <FaGlobe /> Website
            </Link>
          )}

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

          {(isSAdmin || isOrganizer) && <NotificationPanel />}

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
        message="Vui lòng nhập lý do bạn muốn mở khóa tài khoản để Admin xem xét:"
        confirmText="Gửi yêu cầu"
        hasInput={true}
        inputPlaceholder="VD: Tôi đã khắc phục các vấn đề vi phạm..."
      />
    </>
  );
};

export default Topbar;
