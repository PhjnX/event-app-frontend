import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { SLIDE_DATA } from "./data"; // Import data đã tách
import type { AboutSlide } from "@/pages/HomeTemplate/_components/home/models/about-slide"; // Import interface
// Import interface

// --- COMPONENT CON 1: SLIDER HÌNH ẢNH (BÊN TRÁI) ---
const ImageSlider = ({
  currentSlide,
  currentIndex,
}: {
  currentSlide: AboutSlide;
  currentIndex: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group h-[500px] w-full bg-[#1a1a1a]">
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none"></div>

        <AnimatePresence>
          <motion.img
            key={currentSlide.id}
            src={currentSlide.image}
            alt={currentSlide.label}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1, zIndex: 1 }}
            exit={{ opacity: 0, zIndex: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>

      <div className="absolute -bottom-10 -right-4 md:-right-12 z-20 w-72">
        <div className="relative bg-[#0f0f0f]/95 backdrop-blur-xl p-6 rounded-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <motion.div
            animate={{ backgroundColor: currentSlide.color }}
            className="absolute left-0 top-0 bottom-0 w-1"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2 rounded-lg bg-white/5 text-lg"
                  style={{ color: currentSlide.color }}
                >
                  {currentSlide.icon}
                </div>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                  {currentSlide.label}
                </span>
              </div>
              <h3 className="text-white text-xl font-bold leading-tight mb-1">
                {currentSlide.title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2">
                {currentSlide.desc}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/10">
            <motion.div
              key={currentIndex}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              style={{ backgroundColor: currentSlide.color }}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- COMPONENT CON 2: NỘI DUNG TEXT (BÊN PHẢI) ---
const ContentSection = () => {
  return (
    <div className="pl-0 lg:pl-10 relative mt-4">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed text-justify">
          <span className="text-5xl font-bold text-[#B5A65F] float-left mr-3 leading-[0.8] mt-2 font-noto">
            W
          </span>
          ebie Vietnam không chỉ đơn thuần là một công ty công nghệ, chúng tôi
          là sự kết hợp hoàn hảo giữa{" "}
          <span className="text-white font-medium border-b border-[#B5A65F]">
            tư duy sáng tạo
          </span>{" "}
          và{" "}
          <span className="text-white font-medium border-b border-[#B5A65F]">
            giải pháp công nghệ
          </span>
          . Chúng tôi cam kết mang lại những trải nghiệm sự kiện liền mạch và
          đẳng cấp nhất.
        </p>

        <div className="flex gap-8 mb-10 border-t border-white/10 pt-6">
          {[
            { value: "50+", label: "Dự án" },
            { value: "100%", label: "Hài lòng" },
            { value: "24/7", label: "Hỗ trợ" },
          ].map((item, index) => (
            <div key={index}>
              <h4 className="text-3xl font-bold text-white font-noto">
                {item.value}
              </h4>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-block"
        >
          <Link
            to="/about"
            className="group/btn relative inline-flex items-center gap-3 px-8 py-3.5 bg-transparent text-[#B5A65F] font-bold text-sm uppercase tracking-wider rounded-full border border-[#B5A65F] overflow-hidden transition-all duration-300 hover:bg-[#B5A65F] hover:text-black hover:shadow-[0_0_30px_rgba(181,166,95,0.4)]"
          >
            <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/50 to-transparent -skew-x-12 z-10 animate-shine-infinite group-hover/btn:animate-shine-fast" />
            <span className="relative z-20 flex items-center gap-2">
              TÌM HIỂU THÊM{" "}
              <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform duration-300" />
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
const AboutSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDE_DATA.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = SLIDE_DATA[currentIndex];

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden text-white font-noto group-section">
      {/* Background giữ nguyên style inline */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
        }}
      ></div>

      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[#B5A65F] rounded-full blur-[150px] opacity-[0.08] z-0 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="flex flex-col items-center text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-2xl uppercase tracking-tight font-noto">
            VỀ CHÚNG TÔI{" "}
            <span className="text-[#B5A65F] block md:inline">
              WEBIE VIETNAM
            </span>
          </h2>

          <p className="text-base md:text-xl text-gray-300 leading-relaxed max-w-3xl drop-shadow-md mx-auto font-light">
            Đối tác chiến lược trong việc chuyển đổi số các hoạt động giáo dục
            và sự kiện.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <ImageSlider
            currentSlide={currentSlide}
            currentIndex={currentIndex}
          />
          <ContentSection />
        </div>
      </div>

      {/* STYLE GIỮ NGUYÊN TẠI ĐÂY */}
      <style>{`
        /* Import Font Noto Serif */
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&display=swap');
        .font-noto { font-family: 'Noto Serif', serif !important; }

        /* Animation Fade In Up */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }

        /* Animation Shine cho Button */
        @keyframes shine {
            0% { left: -100%; }
            100% { left: 125%; }
        }
        .animate-shine-infinite { animation: shine 4s infinite linear; }
        .group\\/btn:hover .group-hover\\/btn\\:animate-shine-fast {
            animation: shine 0.7s forwards ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default AboutSection;
