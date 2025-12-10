import { motion, type Variants } from "framer-motion";
import { PARTNERS } from "./partners";
import type { Partner } from "@/pages/HomeTemplate/_components/home/models/partner";

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

const PartnerCard = ({ partner }: { partner: Partner }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{
      y: -5,
      borderColor: "rgba(181, 166, 95, 0.4)",
      boxShadow: "0 10px 30px -10px rgba(181, 166, 95, 0.15)",
    }}
    className="group relative h-32 md:h-40 bg-[#0a0a0a]/60 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center p-8 transition-all duration-300 cursor-pointer overflow-hidden hover:bg-white/5"
  >
    <motion.img
      src={partner.logo}
      alt={partner.name}
      className="max-h-full max-w-full object-contain"
      animate={{
        filter: [
          "grayscale(100%) opacity(50%)",
          "grayscale(0%) opacity(100%)",
          "grayscale(100%) opacity(50%)",
        ],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: partner.id * 0.2,
      }}
    />
  </motion.div>
);

const JoinCard = () => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02, borderColor: "#D8C97B" }}
    className="h-32 md:h-40 border-2 border-dashed border-[#D8C97B]/30 rounded-2xl flex flex-col items-center justify-center p-6 text-[#D8C97B] hover:bg-[#D8C97B]/10 transition-all cursor-pointer group"
  >
    <div className="w-10 h-10 rounded-full bg-[#D8C97B]/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
      <span className="text-2xl font-light mb-1">+</span>
    </div>
    <span className="text-xs md:text-sm font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100">
      Hợp tác ngay
    </span>
  </motion.div>
);

export default function PartnersSection() {
  return (
    <section className="relative py-24 text-white font-noto overflow-hidden bg-grid-pattern">
      <div className="container mx-auto px-4 relative z-10">
        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 max-w-4xl mx-auto relative pt-10"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6 leading-tight font-noto">
            KHÁCH HÀNG{" "}
            <span className="text-[#D8C97B] block md:inline">TIÊU BIỂU</span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-3xl mx-auto">
            Chúng tôi vinh dự được đồng hành cùng các doanh nghiệp và tổ chức
            hàng đầu trên cả nước, mang lại giá trị bền vững.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {PARTNERS.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}

          <JoinCard />
        </motion.div>
      </div>
    </section>
  );
}
