import { motion, type Variants } from "framer-motion";
import c1 from "../../../assets/images/Customer_1.jpg";
import c2 from "../../../assets/images/Customer_2.jpg";
import c3 from "../../../assets/images/Customer_3.jpg";
import c4 from "../../../assets/images/Customer_4.jpg";
import c5 from "../../../assets/images/Customer_5.jpg";
import c6 from "../../../assets/images/Customer_6.jpg";
import c7 from "../../../assets/images/Customer_7.jpg";
import c8 from "../../../assets/images/Customer_8.jpg";
import c9 from "../../../assets/images/Customer_9.jpg";

const partners = [
  { id: 1, logo: c1, name: "Partner 1" },
  { id: 2, logo: c2, name: "Partner 2" },
  { id: 3, logo: c3, name: "Partner 3" },
  { id: 4, logo: c4, name: "Partner 4" },
  { id: 5, logo: c5, name: "Partner 5" },
  { id: 6, logo: c6, name: "Partner 6" },
  { id: 7, logo: c7, name: "Partner 7" },
  { id: 8, logo: c8, name: "Partner 8" },
  { id: 9, logo: c9, name: "Partner 9" },
];

// --- CẤU HÌNH ANIMATION (Đã thêm kiểu : Variants cho TypeScript) ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

export default function PartnersSection() {
  return (
    <section
      className="relative py-24 text-white font-sans overflow-hidden"
      // Background Grid gốc của bạn
      style={{
        backgroundColor: "#0a0a0a",
        backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 max-w-4xl mx-auto relative pt-10"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6 leading-tight">
            KHÁCH HÀNG {/* Màu vàng solid #B5A65F theo yêu cầu */}
            <span className="text-[#B5A65F] block md:inline">TIÊU BIỂU</span>
          </h2>

          <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Chúng tôi vinh dự được đồng hành cùng các doanh nghiệp và tổ chức
            hàng đầu trên cả nước, mang lại giá trị bền vững.
          </p>
        </motion.div>

        {/* LOGO GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.id}
              variants={itemVariants}
              whileHover={{
                y: -5,
                borderColor: "rgba(181, 166, 95, 0.4)",
                boxShadow: "0 10px 30px -10px rgba(181, 166, 95, 0.15)",
              }}
              className="group relative h-32 md:h-40 bg-[#0a0a0a]/60 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center p-8 transition-all duration-300 cursor-pointer overflow-hidden hover:bg-white/5"
            >
              {/* --- PHẦN QUAN TRỌNG: AUTO COLOR ANIMATION --- */}
              <motion.img
                src={partner.logo}
                alt={partner.name}
                className="max-h-full max-w-full object-contain"
                // Animation loop vô tận: Trắng đen -> Có màu -> Trắng đen
                animate={{
                  filter: [
                    "grayscale(100%) opacity(50%)", // Bắt đầu: Đen trắng, mờ
                    "grayscale(0%) opacity(100%)", // Giữa: Có màu, rõ nét
                    "grayscale(100%) opacity(50%)", // Kết thúc: Quay lại đen trắng
                  ],
                  scale: [1, 1.05, 1], // Kết hợp phóng to nhẹ khi lên màu
                }}
                transition={{
                  duration: 3, // 3 giây cho 1 vòng lặp
                  repeat: Infinity, // Lặp mãi mãi
                  ease: "easeInOut",
                  // Delay dựa trên ID để các logo không nhấp nháy cùng lúc (nhìn tự nhiên hơn)
                  delay: partner.id * 0.2,
                }}
              />
            </motion.div>
          ))}

          {/* Card Hợp Tác (Giữ nguyên style) */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, borderColor: "#B5A65F" }}
            className="h-32 md:h-40 border-2 border-dashed border-[#B5A65F]/30 rounded-2xl flex flex-col items-center justify-center p-6 text-[#B5A65F] hover:bg-[#B5A65F]/10 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#B5A65F]/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <span className="text-2xl font-light mb-1">+</span>
            </div>
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100">
              Hợp tác ngay
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
