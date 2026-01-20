import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaHandshake,
  FaArrowRight,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import OrganizerRegModal from "../../common/OrganizerRegModal";
import OptimizedImage from "@/components/ui/OptimizedImage";
import EventContact from "@/assets/images/event_contact.webp";
const BackgroundDecoration = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[#0a0a0a]"></div>

    <div
      className="absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage:
          "linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    ></div>

    <motion.div
      animate={{ opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#D8C97B] rounded-full blur-[200px] opacity-[0.08]"
    />
  </div>
);

const InfoCard = ({
  icon,
  title,
  value,
  delay,
}: {
  icon: any;
  title: string;
  value: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-5 p-5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-[#D8C97B]/30 transition-all group"
  >
    <div className="w-12 h-12 rounded-full bg-[#D8C97B]/10 flex items-center justify-center text-[#D8C97B] group-hover:bg-[#D8C97B] group-hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(216,201,123,0.1)] shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-[#D8C97B] transition-colors">
        {title}
      </h4>
      <p className="text-white font-medium text-lg leading-tight">{value}</p>
    </div>
  </motion.div>
);

export default function RegistrationSection() {
  const [showModal, setShowModal] = useState(false);

  return (
    <section
      id="contact"
      className="relative py-20 lg:py-28 bg-[#0a0a0a] overflow-hidden text-white font-noto"
    >
      <BackgroundDecoration />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        {/* --- 1. HEADER (STYLE GIỐNG HÌNH BẠN GỬI) --- */}
        <div className="text-center mb-16 lg:mb-24 relative">
          {/* Vòng tròn trang trí nhỏ (giống hình) */}
          <div className="absolute -top-10 left-10 w-6 h-6 rounded-full border border-[#D8C97B]/30 hidden md:block opacity-50"></div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-noto font-bold uppercase tracking-wide mb-6"
          >
            <span className="text-white">LIÊN HỆ</span>{" "}
            <span className="text-[#D8C97B]">HỢP TÁC</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-zinc-400 text-lg md:text-xl font-noto "
          >
            "Trở thành đối tác chiến lược và cùng Webie kiến tạo sự kiện đẳng
            cấp."
          </motion.p>
        </div>

        {/* --- 2. BODY CONTENT (LAYOUT MỚI: CTA & INFO) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* --- LEFT SIDE: INTRODUCTION & CTA BUTTON --- */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <h3 className="text-3xl font-bold mb-6">Bạn là Ban Tổ Chức?</h3>
            <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-lg font-light">
              Gia nhập mạng lưới đối tác của chúng tôi để tiếp cận công nghệ
              quản lý sự kiện tiên tiến, hệ thống Check-in Face ID và cộng đồng
              sinh viên năng động.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
              <button
                onClick={() => setShowModal(true)}
                className="group relative px-10 py-5 rounded-xl bg-linear-to-r from-[#D8C97B] to-[#cbb865] text-black font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(216,201,123,0.3)] hover:shadow-[0_0_50px_rgba(216,201,123,0.5)] transition-all transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out skew-y-12"></div>
                <span className="relative flex items-center justify-center gap-3">
                  <FaHandshake className="text-lg" />
                  Đăng Ký Ngay
                </span>
              </button>

              <a
                href="tel:0969838467"
                className="px-10 py-5 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-300 font-bold uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-3 group/link"
              >
                Gọi Hotline
                <FaArrowRight className="group-hover/link:translate-x-1 transition-transform text-[#D8C97B]" />
              </a>
            </div>
          </motion.div>

          <div className="w-full relative">
            <div className="absolute -left-10 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-[#D8C97B]/30 to-transparent hidden lg:block"></div>

            <div className="space-y-4">
              <InfoCard
                delay={0.2}
                icon={<FaPhoneAlt />}
                title="Hotline 24/7"
                value="+84 969 838 467"
              />
              <InfoCard
                delay={0.3}
                icon={<FaEnvelope />}
                title="Email Business"
                value="Huyen.dang@webie.com.vn"
              />
              <InfoCard
                delay={0.4}
                icon={<FaMapMarkerAlt />}
                title="Văn Phòng"
                value="Số 53, đường 57, An Phú, TP Thủ Đức"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 rounded-xl overflow-hidden h-40 border border-white/10 relative group"
            >
              <div className="group relative overflow-hidden">
                <OptimizedImage
                  src={EventContact}
                  alt="Event"
                  width={1200}
                  height={400}
                  aspectRatio="21/9"
                  objectFit="cover"
                  imgClassName="opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                  className="rounded-xl"
                  priority={false}
                />
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-5">
                <p className="text-[#D8C97B] text-[10px] font-bold uppercase tracking-widest">
                  Webie Event Tech
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <OrganizerRegModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </section>
  );
}
