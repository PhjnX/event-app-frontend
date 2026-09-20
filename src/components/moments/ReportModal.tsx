import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaFlag, FaSpinner } from "react-icons/fa";
import { REPORT_REASONS } from "@/constants/moderation";
import type { ReportReason } from "@/models/moderation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, detail: string) => void;
  isSubmitting: boolean;
}

/** Modal chọn lý do báo cáo một moment. */
const ReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason(null);
      setDetail("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-noto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-[#18181b] border border-zinc-700/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/2 shrink-0">
          <h3 className="text-sm font-bold text-white uppercase flex gap-2 items-center tracking-wider">
            <FaFlag className="text-red-500" /> Báo cáo nội dung
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Chỉ danh sách lý do được cuộn. Ô mô tả và hai nút luôn nằm trong
            tầm mắt, thay vì đẩy cả hộp thoại dài quá màn hình. */}
        <div className="p-5 flex flex-col min-h-0 flex-1">
          <p className="text-xs text-zinc-500 mb-3 leading-relaxed shrink-0">
            Báo cáo của bạn ẩn danh với người đăng. Đội ngũ kiểm duyệt sẽ xem xét
            trong vòng 24 giờ.
          </p>

          <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-1 -mr-1">
            {REPORT_REASONS.map((r) => {
              const active = reason === r.value;
              return (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    active
                      ? "bg-[#D4AF37]/10 border-[#D4AF37]/50"
                      : "bg-white/2 border-white/8 hover:border-white/20"
                  }`}
                >
                  <span
                    className={`mt-1 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      active ? "border-[#D4AF37]" : "border-zinc-600"
                    }`}
                  >
                    {active && (
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-white">
                      {r.label}
                    </span>
                    <span className="block text-[11px] text-zinc-500 mt-0.5 leading-snug">
                      {r.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            maxLength={500}
            placeholder="Mô tả thêm (không bắt buộc)..."
            className="mt-3 shrink-0 w-full bg-[#222] border border-white/10 rounded-xl p-3.5 text-zinc-100 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 outline-none min-h-[72px] text-sm resize-none leading-relaxed"
          />
        </div>

        <div className="p-4 bg-white/2 flex justify-end gap-3 border-t border-white/5 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 uppercase transition-all"
          >
            Hủy
          </button>
          <button
            onClick={() => reason && onSubmit(reason, detail.trim())}
            disabled={!reason || isSubmitting}
            className={`px-6 py-2.5 text-xs font-bold rounded-lg uppercase transition-all flex items-center gap-2 ${
              reason && !isSubmitting
                ? "bg-red-600 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
          >
            {isSubmitting && <FaSpinner className="animate-spin" />}
            Gửi báo cáo
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportModal;
