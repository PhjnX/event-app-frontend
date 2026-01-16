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

// Import actions
import {
  requestUnlockOrganizer,
  fetchOrganizerDetail,
} from "@/store/slices/organizerSlice";
import { fetchCurrentUser } from "@/store/slices/auth";

interface LockedGuardProps {
  children: React.ReactNode;
  fallbackType?: "BLOCK" | "HIDDEN";
}

export default function LockedGuard({
  children,
  fallbackType = "BLOCK",
}: LockedGuardProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Lấy thông tin user từ Auth slice
  const { user, isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );

  // State lưu thông tin chi tiết Organizer (được fetch bằng SLUG)
  const [organizerDetail, setOrganizerDetail] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  // --- LOGIC FETCH DỮ LIỆU ---
  useEffect(() => {
    const performCheck = async () => {
      setIsChecking(true);

      let currentUser = user;

      // 1. Đảm bảo User đã load xong
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

      // 2. Nếu User là ORGANIZER -> Tìm SLUG -> Gọi API chi tiết
      if (currentUser?.role === "ORGANIZER") {
        // Lấy slug: Thường nằm trong object user.organizer hoặc user.username (nếu logic hệ thống dùng username làm slug)
        // Bạn check lại response user của bạn, code dưới ưu tiên user.organizer.slug
        const slug =
          (currentUser as any).organizer?.slug ||
          (currentUser as any).slug ||
          (currentUser as any).username;

        if (slug) {
          try {
            // 👇 GỌI API LẤY CHI TIẾT THEO SLUG
            const resultAction = await dispatch(fetchOrganizerDetail(slug));
            if (fetchOrganizerDetail.fulfilled.match(resultAction)) {
              setOrganizerDetail(resultAction.payload);
            }
          } catch (error) {
            console.error("Lỗi fetch chi tiết organizer:", error);
          }
        } else {
          console.warn("Không tìm thấy slug trong user object");
        }
      }

      setIsChecking(false);
    };

    performCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // --- LOGIC HIỂN THỊ ---

  // 1. Màn hình chờ khi đang check quyền
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

  // 2. Nếu không phải Organizer (Admin hoặc User thường) -> Cho phép truy cập
  if (user?.role !== "ORGANIZER") {
    return <>{children}</>;
  }

  // 3. Quyết định trạng thái (Ưu tiên data từ API Detail vừa fetch)
  const finalData = organizerDetail || (user as any)?.organizer;

  const isPending = finalData?.approved === false; // Chưa duyệt
  const isLocked = finalData?.locked === true; // Đã duyệt nhưng bị Admin khóa

  // Nếu tài khoản sạch (Không pending, không locked) -> Hiện nội dung
  if (!isPending && !isLocked) {
    return <>{children}</>;
  }

  // --- GIAO DIỆN CHẶN (BLOCK UI) ---

  if (fallbackType === "HIDDEN") return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy các thông tin cần thiết cho action mở khóa
  const isUnlockRequested = finalData?.unlockRequested;
  const orgId = finalData?.organizerId || finalData?.id; // API request unlock cần ID
  const orgSlug = finalData?.slug; // Dùng slug để reload data sau khi request

  const handleRequestUnlock = async () => {
    if (!orgId) return;
    setIsSubmitting(true);
    try {
      await dispatch(requestUnlockOrganizer(orgId)).unwrap();
      toast.success("Đã gửi yêu cầu thành công!");

      // Reload lại data bằng slug để cập nhật UI nút bấm
      if (orgSlug) {
        const res = await dispatch(fetchOrganizerDetail(orgSlug));
        if (fetchOrganizerDetail.fulfilled.match(res)) {
          setOrganizerDetail(res.payload);
        }
      }
    } catch (e) {
      toast.error("Gửi yêu cầu thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-[#121212] rounded-3xl border border-red-500/20 shadow-2xl relative overflow-hidden group">
      {/* Hiệu ứng nền */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent opacity-50 pointer-events-none" />

      {/* Icon trạng thái */}
      <div className="relative z-10 mb-6 p-5 rounded-full bg-[#1a1a1a] border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        {isPending ? (
          <FaExclamationTriangle className="text-4xl text-yellow-500 animate-pulse" />
        ) : (
          <FaLock className="text-4xl text-red-500" />
        )}
      </div>

      {/* Tiêu đề */}
      <h2 className="relative z-10 text-3xl font-black text-white mb-3 uppercase tracking-wide">
        {isPending ? "Hồ sơ đang chờ duyệt" : "Tài khoản bị khóa"}
      </h2>

      {/* Mô tả */}
      <p className="relative z-10 text-gray-400 max-w-lg mb-8 leading-relaxed">
        {isPending
          ? "Hồ sơ của bạn đang chờ Ban Quản Trị phê duyệt. Vui lòng quay lại sau."
          : "Tài khoản của bạn đã bị tạm khóa do vi phạm chính sách. Bạn không thể tạo sự kiện lúc này."}
      </p>

      {/* Nút hành động (Chỉ hiện khi bị Locked, không hiện khi Pending) */}
      {!isPending && isLocked && (
        <div className="relative z-10">
          <button
            onClick={handleRequestUnlock}
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
    </div>
  );
}
