import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaBan,
  FaSpinner,
  FaShieldAlt,
  FaEyeSlash,
  FaUndo,
} from "react-icons/fa";

import {
  getCachedBlockedUsers,
  syncBlockedUsers,
  unblockUser,
  getHiddenMoments,
  unhideMomentLocally,
} from "@/services/moderationService";
import type { BlockedUser, HiddenMoment } from "@/models/moderation";
import { parseServerDate } from "@/utils/datetime";

/** Quản lý danh sách người dùng đã chặn. */
export default function BlockedUsersPage() {
  const [list, setList] = useState<BlockedUser[]>(getCachedBlockedUsers());
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [hidden, setHidden] = useState<HiddenMoment[]>(() => getHiddenMoments());

  useEffect(() => {
    syncBlockedUsers()
      .then(setList)
      .finally(() => setIsLoading(false));
  }, []);

  const handleUnblock = async (u: BlockedUser) => {
    setBusyId(u.userId);
    try {
      setList(await unblockUser(u.userId));
      toast.success(`Đã bỏ chặn ${u.username}`);
    } catch {
      toast.error("Bỏ chặn thất bại, vui lòng thử lại.");
    } finally {
      setBusyId(null);
    }
  };

  // Bài ẩn chỉ nằm trên máy này, bỏ ẩn không cần gọi server
  const handleUnhide = (m: HiddenMoment) => {
    setHidden(unhideMomentLocally(m.id));
    toast.success("Đã bỏ ẩn bài viết. Tải lại trang Moments để thấy lại.");
  };

  return (
    <div className="min-h-screen bg-black text-white font-noto selection:bg-[#D4AF37] selection:text-black">
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-32 pb-24">
        <header className="mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-5">
            <Link
              to="/community-guidelines"
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 hover:border-[#D4AF37] transition-all group shrink-0"
            >
              <FaArrowLeft className="text-zinc-300 group-hover:text-[#D4AF37] text-sm" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaShieldAlt className="text-[#D4AF37] text-xs" />
                <p className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-[0.2em]">
                  An toàn nội dung
                </p>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">
                Người dùng đã chặn
              </h1>
            </div>
          </div>
        </header>

        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">
          Người dùng đã chặn
        </h2>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <FaSpinner className="text-[#D4AF37] animate-spin text-3xl" />
          </div>
        ) : list.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl bg-black/20 px-8 text-center">
            <div className="w-20 h-20 bg-[#111] rounded-full flex items-center justify-center mb-6">
              <FaBan className="text-3xl text-zinc-700" />
            </div>
            <p className="text-zinc-300 font-bold uppercase tracking-widest text-sm">
              Bạn chưa chặn ai
            </p>
            <p className="text-zinc-500 text-sm mt-3 max-w-sm leading-relaxed">
              Người bạn chặn sẽ không xuất hiện trong Moments và bạn sẽ không
              thấy nội dung của họ.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {list.map((u) => (
                <motion.div
                  layout
                  key={u.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#18181b] border border-white/5"
                >
                  <img
                    src={
                      u.avatarUrl ||
                      `https://ui-avatars.com/api/?background=random&color=fff&name=${u.username}`
                    }
                    alt={u.username}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {u.username}
                    </p>
                    {u.blockedAt && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Chặn ngày{" "}
                        {parseServerDate(u.blockedAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnblock(u)}
                    disabled={busyId === u.userId}
                    className="px-5 py-2.5 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider hover:bg-[#D4AF37] hover:text-black transition-all disabled:opacity-40 flex items-center gap-2 shrink-0"
                  >
                    {busyId === u.userId && (
                      <FaSpinner className="animate-spin" />
                    )}
                    Bỏ chặn
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Bài viết đã ẩn ───────────────────────────────────────────────── */}
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 mt-16 mb-4">
          Bài viết đã ẩn
        </h2>
        <p className="text-xs text-zinc-600 mb-5 leading-relaxed max-w-xl">
          Những bài bạn đã ẩn hoặc đã báo cáo. Danh sách này chỉ lưu trên trình
          duyệt hiện tại, không đồng bộ sang thiết bị khác. Bỏ ẩn không rút lại
          báo cáo đã gửi.
        </p>

        {hidden.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl bg-black/20 px-8 text-center">
            <FaEyeSlash className="text-2xl text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">
              Bạn chưa ẩn bài viết nào trên trình duyệt này.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {hidden.map((m) => (
                <motion.div
                  layout
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#18181b] border border-white/5"
                >
                  <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                    {m.imageUrl ? (
                      <img
                        src={m.imageUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-40 blur-[2px]"
                      />
                    ) : (
                      <FaEyeSlash className="text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 truncate">
                      {m.caption?.trim() || (
                        <span className="italic text-zinc-600">
                          Bài viết chỉ có ảnh
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                      {m.username ? `${m.username} · ` : ""}
                      {m.hiddenAt
                        ? `Ẩn ngày ${parseServerDate(m.hiddenAt).toLocaleDateString("vi-VN")}`
                        : `Bài #${m.id}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnhide(m)}
                    className="px-5 py-2.5 rounded-xl border border-white/15 text-zinc-300 text-[11px] font-bold uppercase tracking-wider hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all flex items-center gap-2 shrink-0"
                  >
                    <FaUndo className="text-[10px]" />
                    Bỏ ẩn
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
