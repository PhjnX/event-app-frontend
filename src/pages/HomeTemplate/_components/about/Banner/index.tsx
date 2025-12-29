import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import banner from "../../../../../assets/images/banner.jpg";

const HERO_IMAGE = banner;

const AboutHero = () => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section
      ref={ref}
      className="relative h-screen w-full overflow-hidden bg-[#0a0a0a] flex items-center justify-center font-noto selection:bg-[#D8C97B] selection:text-black"
    >
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 z-0">
        <img
          src={HERO_IMAGE}
          alt="Event Manager System Background"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black/70 z-10" />
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/40 z-20" />
        <div
          className="absolute inset-0 z-30 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </motion.div>

      <div className="relative z-40 container mx-auto px-4 flex flex-col items-center justify-center h-full">
        <motion.div
          style={{ y: textY, opacity: textOpacity, scale: textScale }}
          className="text-center w-full flex flex-col items-center"
        >

          <div className="relative flex flex-col items-center justify-center overflow-hidden py-4">
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.2,
                }}
                className="text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tight leading-tight mb-2 drop-shadow-2xl"
              >
                Event Manager <br className="md:hidden" />
                <span className="text-[#D8C97B]">System</span>
              </motion.h1>
            </div>

            <div className="overflow-hidden mt-4">
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.4,
                }}
                className="flex items-center gap-3 text-white/60"
              >
                <div className="h-px w-8 bg-white/30"></div>
                <p className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase">
                  Created by{" "}
                  <span className="text-[#D8C97B] font-bold">
                    Webie Vietnam
                  </span>
                </p>
                <div className="h-px w-8 bg-white/30"></div>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
            className="mt-10 max-w-2xl text-center px-4"
          >
            <p className="text-gray-400 text-sm md:text-lg font-normal leading-relaxed border-t border-white/10 pt-6">
              Chúng tôi kiến tạo giải pháp công nghệ toàn diện, giúp tối ưu hóa
              quy trình quản lý cho hệ sinh thái giáo dục và sự kiện tại Việt
              Nam.
            </p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-widest text-white/50 animate-pulse">
          Scroll
        </span>
        <div className="relative w-px h-16 bg-white/10 overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-transparent via-[#D8C97B] to-transparent"
          ></motion.div>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;0,900;1,400&display=swap');
        .font-noto { font-family: 'Noto Serif', serif !important; }
      `}</style>
    </section>
  );
};

export default AboutHero;
