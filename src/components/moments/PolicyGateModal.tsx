import React from "react";
import { motion } from "framer-motion";
import { FaTimes, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import { COMMUNITY_GUIDELINES } from "@/constants/moderation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

/**
 * Bắt người dùng đọc và đồng ý quy tắc cộng đồng trước lần đăng đầu tiên.
 * Yêu cầu bắt buộc của Google Play UGC policy.
 */
const PolicyGateModal: React.FC<Props> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-noto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-[#18181b] border border-zinc-700/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/2 shrink-0">
          <h3 className="text-sm font-bold text-white uppercase flex gap-2 items-center tracking-wider">
            <FaShieldAlt className="text-[#D4AF37]" /> Quy tắc cộng đồng
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar">
          <p className="text-xs text-zinc-500 mb-5 leading-relaxed">
            Trước khi đăng lần đầu, vui lòng đọc và đồng ý với các quy tắc sau.
          </p>

          <div className="space-y-4">
            {COMMUNITY_GUIDELINES.map((g, i) => (
              <div key={i} className="flex gap-3">
                <FaCheckCircle className="text-[#D4AF37] mt-1 shrink-0 text-sm" />
                <div>
                  <p className="text-sm font-bold text-white">{g.heading}</p>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {g.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-white/2 flex justify-end gap-3 border-t border-white/5 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 uppercase transition-all"
          >
            Hủy
          </button>
          <button
            onClick={onAccept}
            className="px-6 py-2.5 bg-[#D4AF37] text-black text-xs font-bold rounded-lg hover:bg-[#c9b96e] uppercase shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
          >
            Tôi đồng ý
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PolicyGateModal;
