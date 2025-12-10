import React from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import bgValue from "../../../../../assets/images/background-value.png";

const textVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, filter: "blur(20px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.5, ease: "easeOut" },
  },
};

const HeroManifesto: React.FC = () => {
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 500], [0, 200]); // Parallax Text
  const yBg = useTransform(scrollY, [0, 500], [0, 100]); // Parallax Background (chậm hơn text)

  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-[#0a0a0a] font-noto">
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: yBg }} 
      >
        <motion.img
          src={bgValue}
          alt="Abstract Tech"
          className="w-full h-full object-cover"
          animate={{ scale: [1, 1.15] }}
          transition={{
            duration: 20, 
            repeat: Infinity,
            repeatType: "reverse", 
            ease: "linear",
          }}
        />

        <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>

        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
      </motion.div>

      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(181, 166, 95, 0.1) 1px, transparent 1px), 
          linear-gradient(90deg, rgba(181, 166, 95, 0.1) 1px, transparent 1px)`,
          backgroundSize: "80px 80px", 
        }}
      ></div>

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#D8C97B] blur-[2px]"
            style={{
              width: Math.random() * 4 + 2 + "px", 
              height: Math.random() * 4 + 2 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: 0.4,
            }}
            animate={{
              y: [0, -100, 0], 
              x: [0, Math.random() * 50 - 25, 0], 
              opacity: [0.2, 0.6, 0.2], 
            }}
            transition={{
              duration: Math.random() * 10 + 10, 
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div style={{ y: yText }} className="space-y-8">
          <motion.h1
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-2xl"
          >
            KIẾN TẠO <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#D8C97B] via-[#F2E6A0] to-[#D8C97B] animate-gradient-x bg-size-[200%_auto]">
              TƯƠNG LAI SỐ
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-gray-200 text-lg md:text-2xl font-light max-w-2xl mx-auto italic drop-shadow-md"
          >
            "Sứ mệnh của Webie là xóa bỏ khoảng cách giữa con người và công nghệ
            thông qua những trải nghiệm đột phá."
          </motion.p>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 120, opacity: 1 }}
            transition={{ delay: 1.2, duration: 1.5 }}
            className="w-px bg-linear-to-b from-[#D8C97B] to-transparent mx-auto mt-12 shadow-[0_0_10px_#D8C97B]"
          ></motion.div>
        </motion.div>
      </div>

      {/* CSS Animation cho chữ Tương Lai Số óng ánh */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroManifesto;
