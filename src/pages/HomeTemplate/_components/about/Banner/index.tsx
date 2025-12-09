import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import banner from "../../../../../assets/images/banner.jpg";
// Ảnh Background
const HERO_IMAGE = banner;

const AboutHero = () => {
  const ref = useRef(null);

  // Lấy thông số cuộn trang
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // --- CÁC HIỆU ỨNG SCROLL ---
  // 1. Ảnh nền trôi chậm (Parallax)
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // 2. Chữ trôi lên nhanh hơn nền
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // 3. Chữ mờ dần khi cuộn xuống (Fade out) -> Tạo cảm giác mượt mà
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // 4. Chữ nhỏ lại chút xíu khi cuộn (Depth)
  const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section
      ref={ref}
      className="relative h-screen w-full overflow-hidden bg-[#0a0a0a] flex items-center justify-center font-noto selection:bg-[#B5A65F] selection:text-black"
    >
      {/* --- 1. BACKGROUND LAYERS --- */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 z-0">
        {/* Lớp nền ảnh gốc */}
        <img
          src={HERO_IMAGE}
          alt="Webie Office"
          className="w-full h-full object-cover opacity-80"
        />

        {/* Lớp phủ tối (Dark Overlay) */}
        <div className="absolute inset-0 bg-black/70 z-10" />

        {/* Gradient mờ ở dưới đáy để hòa trộn với section sau */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/40 z-20" />

        {/* --- PATTERN CHẤM BI TRẮNG (Đã đưa lên trên Overlay để rõ hơn) --- */}
        <div
          className="absolute inset-0 z-30 opacity-20 pointer-events-none"
          style={{
            // Radial Gradient tạo chấm tròn
            backgroundImage:
              "radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)",
            backgroundSize: "40px 40px", // Khoảng cách giữa các chấm
          }}
        ></div>
      </motion.div>

      {/* --- 2. MAIN CONTENT (Có hiệu ứng scroll fade/scale) --- */}
      <div className="relative z-40 container mx-auto px-4 flex flex-col items-center justify-center h-full">
        <motion.div
          style={{ y: textY, opacity: textOpacity, scale: textScale }}
          className="text-center w-full flex flex-col items-center"
        >
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
            className="mb-6"
          >
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 40 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-px bg-[#B5A65F]"
              ></motion.div>

              <span className="text-[#B5A65F] text-xs md:text-sm tracking-[0.4em] uppercase font-bold">
                Est. 2022
              </span>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 40 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-px bg-[#B5A65F]"
              ></motion.div>
            </div>
          </motion.div>

          {/* TYPOGRAPHY BLOCK */}
          <div className="relative flex flex-col items-center justify-center overflow-hidden py-4">
            {/* Dòng 1: WEBIE VIETNAM - Hiệu ứng trồi lên */}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.2,
                }} // Ease cực mượt
                className="text-4xl md:text-6xl lg:text-8xl font-black text-white uppercase tracking-tight leading-none mb-2 drop-shadow-2xl"
              >
                WEBIE <span className="text-[#B5A65F]">VIETNAM</span>
              </motion.h1>
            </div>

            {/* Dòng 2: Slogan - Hiệu ứng trồi lên chậm hơn */}
            <div className="overflow-hidden">
              <motion.p
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.4,
                }}
                className="text-xl md:text-3xl lg:text-4xl font-medium italic text-gray-300 tracking-wide mt-2"
              >
                "Your Vision &mdash; Our Creation"
              </motion.p>
            </div>
          </div>

          {/* Description Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
            className="mt-12 max-w-2xl text-center px-4"
          >
            <p className="text-gray-400 text-sm md:text-lg font-normal leading-relaxed border-t border-white/10 pt-6">
              Chúng tôi kiến tạo giải pháp công nghệ toàn diện, giúp tối ưu hóa
              quy trình quản lý cho hệ sinh thái giáo dục và sự kiện tại Việt
              Nam.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* --- 3. SCROLL INDICATOR ANIMATION --- */}
      <motion.div
        style={{ opacity: textOpacity }} // Mờ đi khi cuộn
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-widest text-white/50 animate-pulse">
          Scroll
        </span>
        {/* Đường kẻ chạy dọc */}
        <div className="relative w-px h-16 bg-white/10 overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-transparent via-[#B5A65F] to-transparent"
          ></motion.div>
        </div>
      </motion.div>

      {/* --- FONTS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;0,900;1,400&display=swap');
        .font-noto { font-family: 'Noto Serif', serif !important; }
      `}</style>
    </section>
  );
};

export default AboutHero;
