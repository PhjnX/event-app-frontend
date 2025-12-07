import {
  FaQrcode,
  FaUsers,
  FaChartPie,
  FaTicketAlt,
  FaClipboardList,
  FaCertificate,
} from "react-icons/fa";
// FIX 1: Import thêm TargetAndTransition để sửa lỗi Type cho icon
import { motion, type Variants, type TargetAndTransition } from "framer-motion";

const features = [
  {
    id: 1,
    icon: <FaQrcode className="text-3xl" />,
    title: "CHECK-IN QR SIÊU TỐC",
    description:
      "Quét mã QR Check-in chỉ 01s/người. Xóa bỏ hoàn toàn cảnh xếp hàng ùn tắc tại bàn lễ tân.",
    color: "text-[#B5A65F]",
    bg: "bg-[#B5A65F]/20",
    animType: "pulse",
  },
  {
    id: 2,
    icon: <FaUsers className="text-3xl" />,
    title: "DATABASE TẬP TRUNG",
    description:
      "Lưu trữ thông tin hàng ngàn khách mời trên một hệ thống duy nhất. Không lo thất lạc dữ liệu.",
    color: "text-blue-400",
    bg: "bg-blue-400/20",
    animType: "float",
  },
  {
    id: 3,
    icon: <FaChartPie className="text-3xl" />,
    title: "REAL-TIME ANALYTICS",
    description:
      "Cập nhật số lượng khách tham gia thực tế ngay tức thì (Real-time) trên biểu đồ trực quan.",
    color: "text-green-400",
    bg: "bg-green-400/20",
    animType: "spin",
  },
  {
    id: 4,
    icon: <FaTicketAlt className="text-3xl" />,
    title: "VÉ & THƯ MỜI ĐIỆN TỬ",
    description:
      "Tự động gửi vé qua Email/App. Mỗi vé là một mã định danh duy nhất, chống vé giả tuyệt đối.",
    color: "text-red-400",
    bg: "bg-red-400/20",
    animType: "shake",
  },
  {
    id: 5,
    icon: <FaClipboardList className="text-3xl" />,
    title: "FORM ĐĂNG KÝ SMART",
    description:
      "Tùy biến biểu mẫu đăng ký dễ dàng. Tự động đóng form khi đủ số lượng vé giới hạn.",
    color: "text-purple-400",
    bg: "bg-purple-400/20",
    animType: "wiggle",
  },
  {
    id: 6,
    icon: <FaCertificate className="text-3xl" />,
    title: "CẤP CHỨNG NHẬN SỐ",
    description:
      "Tính năng độc quyền: Tự động cấp giấy chứng nhận (Certificate) tham gia sau khi sự kiện kết thúc.",
    color: "text-orange-400",
    bg: "bg-orange-400/20",
    animType: "bounce",
  },
];

// FIX 2: Khai báo kiểu Record<string, TargetAndTransition> để TypeScript hiểu đây là Animation hợp lệ
const iconVariants: Record<string, TargetAndTransition> = {
  spin: {
    rotate: 360,
    transition: { duration: 10, repeat: Infinity, ease: "linear" },
  },
  bounce: {
    y: [0, -8, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
  pulse: {
    scale: [1, 1.15, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  shake: {
    rotate: [0, -10, 10, -10, 0],
    transition: { duration: 2.5, repeat: Infinity, repeatDelay: 1 },
  },
  float: {
    y: [0, -6, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  wiggle: {
    rotate: [0, 15, -15, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
      repeatDelay: 0.5,
    },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function FeaturesSection() {
  return (
    <section
      className="relative py-24 text-white font-sans overflow-hidden -mt-10 md:-mt-20 z-30"
      style={{
        backgroundColor: "#0a0a0a",
        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.03) 1.5px, transparent 1.5px)`,
        backgroundSize: "40px 40px",
      }}
    >
      <div className="absolute top-0 left-0 w-full h-40 bg-linear-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-0 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 max-w-5xl mx-auto relative pt-10"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6 leading-tight">
            GIẢI PHÁP{" "}
            {/* FIX 3: Thêm 'block md:inline' để mobile xuống dòng cả cụm, không bị rớt chữ 'DIỆN' */}
            <span className="text-[#B5A65F] block md:inline">
              QUẢN LÝ TOÀN DIỆN
            </span>
          </h2>

          <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Thay thế quy trình thủ công rườm rà bằng sức mạnh công nghệ. Kiểm
            soát chính xác từ khâu{" "}
            <span className="text-white font-medium">đăng ký</span>,
            <span className="text-white font-medium"> check-in</span> đến
            <span className="text-white font-medium"> báo cáo</span> sau sự
            kiện.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {features.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group relative bg-[#0a0a0a]/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/5 transition-colors duration-300 flex flex-col h-full hover:border-[#B5A65F]/30"
            >
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} shadow-lg ring-1 ring-white/10`}
                >
                  <motion.div
                    // FIX 4: Gọi biến đã được Typed chính xác, không cần ép kiểu as any nữa
                    animate={iconVariants[item.animType]}
                  >
                    {item.icon}
                  </motion.div>
                </div>
                <span className="text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors pointer-events-none select-none">
                  0{item.id}
                </span>
              </div>

              <h3 className="text-lg md:text-xl font-bold uppercase mb-3 text-gray-100 group-hover:text-[#B5A65F] transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed grow">
                {item.description}
              </p>

              <div className="absolute bottom-0 left-0 w-0 h-[3px] bg-[#B5A65F] group-hover:w-full transition-all duration-700 ease-out opacity-0 group-hover:opacity-100"></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
