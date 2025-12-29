import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  FaLinkedinIn,
  FaEnvelope,
  FaQuoteLeft,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import CEO from "@/assets/images/CEO.jpg";
import CTO1 from "@/assets/images/CTO_1.png";
import CTO2 from "@/assets/images/CTO_2.png";
interface TeamMember {
  id: number;
  name: string;
  role: string;
  quote: string;
  desc: string;
  image: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: "Đặng Vũ Thị Mỹ Huyền",
    role: "CEO & FOUNDER",
    quote: "Công nghệ là chìa khóa mở ra những trải nghiệm không giới hạn.",
    desc: "Chị là người đặt nền móng cho tầm nhìn số hóa của Webie. Chị tin rằng sự kiện giáo dục cần được vận hành như một tác phẩm nghệ thuật: Chính xác và Cảm xúc.",
    image: CEO,
  },
  {
    id: 2,
    name: "Nguyễn Minh Hiếu",
    role: "CHIEF TECHNOLOGY OFFICER",
    quote:
      "Sự ổn định của hệ thống là lời cam kết uy tín nhất gửi đến khách hàng.",
    desc: "Kiến trúc sư trưởng của hệ thống Webie Event. Anh chịu trách nhiệm xây dựng lõi công nghệ bảo mật, xử lý hàng triệu lượt truy cập đồng thời và tích hợp AI vào quy trình check-in.",
    image: CTO1,
  },
  {
    id: 3,
    name: "Trần Công Duy",
    role: "CHIEF TECHNOLOGY OFFICER",
    quote: "Nếu hôm nay chúng ta dừng lại, ngày mai chúng ta sẽ bị bỏ lại.",
    desc: "Phụ trách mảng Nghiên cứu & Phát triển (R&D). Anh luôn tìm kiếm những công nghệ mới nhất (Blockchain, VR/AR) để ứng dụng vào thực tế, giúp Webie luôn đi trước thị trường một bước.",
    image: CTO2,
  },
];

const scrollRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 100,
    scale: 0.9,
    filter: "blur(10px)", 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1], 
    },
  },
};

const TeamSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(timer);
  }, [currentIndex]); 

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % TEAM_MEMBERS.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + TEAM_MEMBERS.length) % TEAM_MEMBERS.length
    );
  };

  const handleSelect = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentMember = TEAM_MEMBERS[currentIndex];

  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4, ease: "easeIn" },
    }),
  };

  return (
    <section className="relative py-24 md:py-32 bg-[#0a0a0a] overflow-hidden font-noto text-white border-t border-white/5">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D8C97B]/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D8C97B]/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <motion.div
          variants={scrollRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }} 
          className="text-center mb-16 md:mb-24"
        >
          <span className="text-[#D8C97B] text-sm tracking-[0.3em] uppercase font-bold border-b border-[#D8C97B] pb-1 inline-block mb-6">
            Ban Lãnh Đạo
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-4 tracking-tight">
            NHỮNG NGƯỜI{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#E5D588]">
              KIẾN TẠO
            </span>
          </h2>
          <p className="text-gray-400 italic text-lg font-light max-w-2xl mx-auto">
            "Bản lĩnh tiên phong, tư duy khác biệt và trái tim nhiệt huyết."
          </p>
        </motion.div>

        <motion.div
          variants={scrollRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }} 
          className="relative"
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[600px]"
            >
              <div className="lg:col-span-5 relative group order-2 lg:order-1 ">
                <div className="absolute top-4 -left-4 w-full h-full border border-[#D8C97B]/30 rounded-br-[40px] z-0 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2" />
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#D8C97B]/10 z-0"></div>

                <div className="relative h-[450px] md:h-[550px] w-full rounded-br-[60px] overflow-hidden shadow-2xl z-10">
                  <motion.img
                    src={currentMember.image}
                    alt={currentMember.name}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60"></div>

                  <div className="absolute bottom-0 left-0 p-6 flex gap-3">
                    <a
                      href="#"
                      className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#D8C97B] hover:text-black transition-all rounded-full text-white"
                    >
                      <FaLinkedinIn />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#D8C97B] hover:text-black transition-all rounded-full text-white"
                    >
                      <FaEnvelope />
                    </a>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 relative order-1 lg:order-2 flex flex-col justify-center">
                <h2 className="absolute -top-10 -left-10 text-8xl md:text-9xl font-black text-white/5 uppercase select-none pointer-events-none whitespace-nowrap z-0">
                  {currentMember.name.split(" ").pop()}
                </h2>

                <div className="relative z-10 pl-4 md:pl-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-px w-12 bg-[#D8C97B]"></div>
                    <span className="text-[#D8C97B] font-bold tracking-widest uppercase text-sm">
                      {currentMember.role}
                    </span>
                  </div>

                  <h3 className="text-4xl md:text-6xl font-bold text-white uppercase mb-8 leading-tight drop-shadow-lg">
                    {currentMember.name}
                  </h3>

                  <div className="relative mb-8">
                    <FaQuoteLeft className="text-[#D8C97B] text-3xl mb-4 opacity-80" />
                    <p className="text-xl md:text-2xl text-gray-200 font-light italic leading-relaxed">
                      "{currentMember.quote}"
                    </p>
                  </div>

                  <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl mb-10 border-l border-white/10 pl-6">
                    {currentMember.desc}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/10 pt-8 mt-4">
                    <div className="flex gap-4">
                      {TEAM_MEMBERS.map((member, idx) => (
                        <button
                          key={member.id}
                          onClick={() => handleSelect(idx)}
                          className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                            idx === currentIndex
                              ? "border-[#D8C97B] scale-110 shadow-[0_0_15px_rgba(181,166,95,0.4)]"
                              : "border-transparent opacity-50 hover:opacity-100 hover:border-white/30"
                          }`}
                        >
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handlePrev}
                        className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#D8C97B] hover:text-black transition-all group"
                      >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#D8C97B] hover:text-black transition-all group"
                      >
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
