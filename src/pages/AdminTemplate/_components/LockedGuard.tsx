import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaLock,
  FaPaperPlane,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import type { RootState, AppDispatch } from "@/store";

import {
  requestUnlockOrganizer,
  fetchMyOrganizerStatus, 
} from "@/store/slices/organizerSlice";
import { fetchCurrentUser } from "@/store/slices/auth";

import ConfirmModal from "./ConfirmModal";

interface LockedGuardProps {
  children: React.ReactNode;
  fallbackType?: "BLOCK" | "HIDDEN";
}

export default function LockedGuard({
  children,
  fallbackType = "BLOCK",
}: LockedGuardProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { user, isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  const [currentStatus, setCurrentStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const performCheck = async () => {
      setIsChecking(true);

      // 1. Đảm bảo User đã load
      let currentUser = user;
      if (!currentUser) {
        try {
          const action = await dispatch(fetchCurrentUser());
          if (fetchCurrentUser.fulfilled.match(action)) {
            currentUser = action.payload;
          }
        } catch (e) {
          console.error("Lỗi load user:", e);
        }
      }

      // 2. Nếu là Organizer -> Gọi API /me/status để lấy trạng thái CHÍNH XÁC NHẤT
      if (currentUser?.role === "ORGANIZER") {
        try {
          const statusAction = await dispatch(fetchMyOrganizerStatus());
          if (fetchMyOrganizerStatus.fulfilled.match(statusAction)) {
            setCurrentStatus(statusAction.payload);
          }
        } catch (error) {
          console.error("Lỗi kiểm tra status:", error);
        }
      }

      setIsChecking(false);
    };

    performCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]); // Chỉ chạy 1 lần khi mount

  if (authLoading || isChecking) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
        <FaSpinner className="animate-spin text-2xl text-[#B5A65F]" />
        <span className="text-gray-500 text-sm font-mono">
          Đang kiểm tra trạng thái...
        </span>
      </div>
    );
  }

  if (user?.role !== "ORGANIZER") {
    return <>{children}</>;
  }

  // Ưu tiên dùng dữ liệu mới fetch từ API /me/status
  // Nếu chưa có thì dùng tạm từ user (nhưng user thường cũ)
  const finalData = currentStatus || (user as any)?.organizer;

  const isPending = finalData?.approved === false;
  const isLocked = finalData?.locked === true;

  if (!isPending && !isLocked) {
    return <>{children}</>;
  }

  if (fallbackType === "HIDDEN") return null;

  const isUnlockRequested = finalData?.unlockRequested;

  const handleConfirmRequest = async (reason?: string) => {
    setIsSubmitting(true);
    try {
      await dispatch(requestUnlockOrganizer(reason || "")).unwrap();
      toast.success("Đã gửi yêu cầu thành công!");

      const res = await dispatch(fetchMyOrganizerStatus());
      if (fetchMyOrganizerStatus.fulfilled.match(res)) {
        setCurrentStatus(res.payload);
      }
    } catch (e: any) {
      toast.error(e?.message || "Gửi yêu cầu thất bại.");
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-[#121212] rounded-3xl border border-red-500/20 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent opacity-50 pointer-events-none" />

      <div className="relative z-10 mb-6 p-5 rounded-full bg-[#1a1a1a] border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        {isPending ? (
          <FaExclamationTriangle className="text-4xl text-yellow-500 animate-pulse" />
        ) : (
          <FaLock className="text-4xl text-red-500" />
        )}
      </div>

      <h2 className="relative z-10 text-3xl font-black text-white mb-3 uppercase tracking-wide">
        {isPending ? "Hồ sơ đang chờ duyệt" : "Tài khoản bị khóa"}
      </h2>

      <p className="relative z-10 text-gray-400 max-w-lg mb-8 leading-relaxed">
        {isPending
          ? "Hồ sơ của bạn đang chờ Ban Quản Trị phê duyệt. Vui lòng quay lại sau."
          : "Tài khoản của bạn đã bị tạm khóa do vi phạm chính sách. Bạn không thể tạo sự kiện lúc này."}
      </p>

      {!isPending && isLocked && (
        <div className="relative z-10">
          <button
            onClick={() => setShowModal(true)}
            disabled={isSubmitting || isUnlockRequested}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg uppercase text-sm tracking-wider ${
              isUnlockRequested
                ? "bg-gray-800 text-gray-400 cursor-not-allowed border border-white/5"
                : "bg-red-600 hover:bg-red-700 text-white shadow-red-900/40 transform hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            {isSubmitting ? (
              <FaSpinner className="animate-spin text-lg" />
            ) : isUnlockRequested ? (
              <FaCheckCircle />
            ) : (
              <FaPaperPlane className="animate-bounce" />
            )}
            {isUnlockRequested
              ? "Đã gửi yêu cầu - Đang chờ"
              : "Gửi yêu cầu mở khóa"}
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmRequest}
        title="Yêu cầu mở khóa"
        message="Vui lòng nhập lý do để Admin xem xét mở khóa tài khoản:"
        confirmText="Gửi yêu cầu"
        type="APPROVE"
        hasInput={true}
        inputPlaceholder="VD: Tôi đã khắc phục sự cố..."
      />
    </div>
  );
}
