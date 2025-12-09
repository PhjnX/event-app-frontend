import { motion, type Variants } from "framer-motion";

// Import hình ảnh (Giả sử đường dẫn đúng như bạn cung cấp)
import c1 from "../../../../../assets/images/Customer_1.jpg";
import c2 from "../../../../../assets/images/Customer_2.jpg";
import c3 from "../../../../../assets/images/Customer_3.jpg";
import c4 from "../../../../../assets/images/Customer_4.jpg";
import c5 from "../../../../../assets/images/Customer_5.jpg";
import c6 from "../../../../../assets/images/Customer_6.jpg";
import c7 from "../../../../../assets/images/Customer_7.jpg";
import c8 from "../../../../../assets/images/Customer_8.jpg";
import c9 from "../../../../../assets/images/Customer_9.jpg";

// --- 1. TYPESCRIPT INTERFACES ---
interface Partner {
  id: number;
  logo: string;
  name: string;
}

const partners: Partner[] = [
  { id: 1, logo: c1, name: "Minh Nguyen Design" },
  { id: 2, logo: c2, name: "Ogawa" },
  { id: 3, logo: c3, name: "CTBCN Engineering" },
  { id: 4, logo: c4, name: "Partner 4" },
  { id: 5, logo: c5, name: "Partner 5" },
  { id: 6, logo: c6, name: "Partner 6" },
  { id: 7, logo: c7, name: "Partner 7" },
  { id: 8, logo: c8, name: "Partner 8" },
  { id: 9, logo: c9, name: "Partner 9" },
];

// --- 2. ANIMATION VARIANTS (Cinematic Scroll) ---
const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const revealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: "blur(10px)", // Hiệu ứng mờ khi ẩn
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)", // Rõ nét khi hiện
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const sloganVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: "easeOut", delay: 0.2 },
  },
};

export default function CustomerSection() {
  return (
    <section className="relative py-28 bg-[#0a0a0a] overflow-hidden font-noto text-white">
      {/* BACKGROUND DECORATION (Tech Lines mờ) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(181, 166, 95, 0.05) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(181, 166, 95, 0.05) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        ></div>
        {/* Glow center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[400px] bg-[#B5A65F]/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* --- PART 1: LOGO GRID (Clean Style) --- */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }} // Scroll reveal settings
          className="mb-24"
        >
          {/* Header nhỏ cho phần Partners */}
          <motion.div variants={revealVariants} className="text-center mb-12">
            <span className="text-xs font-bold tracking-[0.3em] text-gray-500 uppercase border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              Được tin tưởng bởi
            </span>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 items-center justify-items-center">
            {partners.map((partner) => (
              <motion.div
                key={partner.id}
                variants={revealVariants}
                className="group w-full flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100 cursor-pointer"
              >
                {/* Logo Image */}
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-12 md:max-h-16 w-auto object-contain transform group-hover:scale-110 transition-transform duration-500 drop-shadow-lg"
                />
              </motion.div>
            ))}

            {/* Nút "Và nhiều hơn nữa" ẩn dụ */}
            <motion.div
              variants={revealVariants}
              className="flex flex-col items-center justify-center opacity-40"
            >
              <div className="flex gap-1 mb-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-75"></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-150"></span>
              </div>
              <span className="text-[10px] uppercase tracking-wider">More</span>
            </motion.div>
          </div>
        </motion.div>

        {/* --- PART 2: SLOGAN (Typography Focus) --- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          className="relative text-center border-t border-white/10 pt-20"
        >
          {/* Decorative bracket lines */}
          <div className="absolute top-0 left-0 w-px h-20 bg-gradient-to-b from-transparent via-[#B5A65F] to-transparent opacity-50"></div>
          <div className="absolute top-0 right-0 w-px h-20 bg-gradient-to-b from-transparent via-[#B5A65F] to-transparent opacity-50"></div>

          {/* MAIN HEADLINE */}
          <motion.h2
            variants={sloganVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-noto font-bold text-[#B5A65F] tracking-wide mb-8 drop-shadow-2xl"
          >
            WEBIE – WE WILL BE
          </motion.h2>

          {/* SUBTEXT */}
          <motion.div
            variants={revealVariants}
            className="max-w-3xl mx-auto space-y-2"
          >
            <p className="text-lg md:text-2xl text-white font-medium">
              Chúng tôi sẽ là lực lượng sáng tạo của bạn.
            </p>
            <p className="text-base md:text-xl text-gray-400 font-light italic">
              "Webie không chỉ tạo ra giải pháp, chúng tôi mang lại kết quả."
            </p>
          </motion.div>

          {/* Decorative Signature / Bottom Line */}
          <motion.div
            variants={revealVariants}
            className="mt-12 flex justify-center items-center gap-4 opacity-30"
          >
            <div className="h-px w-20 bg-white"></div>
            <span className="text-xs tracking-[0.2em] uppercase">
              Since 2025
            </span>
            <div className="h-px w-20 bg-white"></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
