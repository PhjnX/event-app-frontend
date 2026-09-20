import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaShieldAlt, FaEnvelope, FaBan } from "react-icons/fa";
import {
  COMMUNITY_GUIDELINES,
  MODERATION_CONTACT_EMAIL,
} from "@/constants/moderation";

/** Trang quy tắc cộng đồng cho Moments — chỉ để đọc. */
export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-black text-white font-noto selection:bg-[#D4AF37] selection:text-black">
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-32 pb-24">
        <header className="mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-5">
            <Link
              to="/my-tickets"
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
                Quy tắc cộng đồng
              </h1>
            </div>
          </div>
        </header>

        <p className="text-zinc-400 text-sm leading-relaxed mb-10 max-w-2xl">
          Moments cho phép người tham gia sự kiện chia sẻ ảnh và khoảnh khắc với
          nhau. Để giữ không gian an toàn, mọi người dùng phải tuân thủ các quy
          tắc dưới đây. Nội dung vi phạm sẽ bị gỡ và tài khoản có thể bị khoá.
        </p>

        <div className="space-y-4">
          {COMMUNITY_GUIDELINES.map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#18181b] border border-white/5 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-[#D4AF37]/12 text-[#D4AF37] text-xs font-black flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <h2 className="text-base font-bold text-white">{g.heading}</h2>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{g.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            to="/blocked-users"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white/2 border border-white/8 hover:border-[#D4AF37]/40 transition-all group"
          >
            <FaBan className="text-[#D4AF37] shrink-0" />
            <div>
              <p className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                Người dùng đã chặn
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Xem và bỏ chặn người bạn đã chặn
              </p>
            </div>
          </Link>

          <a
            href={`mailto:${MODERATION_CONTACT_EMAIL}?subject=Phản hồi về nội dung Moments`}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white/2 border border-white/8 hover:border-[#D4AF37]/40 transition-all group"
          >
            <FaEnvelope className="text-[#D4AF37] shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                Liên hệ đội ngũ kiểm duyệt
              </p>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">
                {MODERATION_CONTACT_EMAIL}
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
