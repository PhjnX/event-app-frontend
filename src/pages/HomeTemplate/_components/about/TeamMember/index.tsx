import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { FaQuoteLeft, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import CEO from "@/assets/images/CEO.webp";
import CTO1 from "@/assets/images/CTO_1.webp";
import CTO2 from "@/assets/images/CTO_2.webp";
import { useTranslation } from "react-i18next";

interface TeamMember {
  id: number;
  name: string;
  roleKey: string;
  quoteKey: string;
  descKey: string;
  image: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: "Đặng Vũ Thị Mỹ Huyền",
    roleKey: "about_page.team.members.1.role",
    quoteKey: "about_page.team.members.1.quote",
    descKey: "about_page.team.members.1.desc",
    image: CEO,
  },
  {
    id: 2,
    name: "Nguyễn Minh Hiếu",
    roleKey: "about_page.team.members.2.role",
    quoteKey: "about_page.team.members.2.quote",
    descKey: "about_page.team.members.2.desc",
    image: CTO1,
  },
  {
    id: 3,
    name: "Trần Công Duy",
    roleKey: "about_page.team.members.3.role",
    quoteKey: "about_page.team.members.3.quote",
    descKey: "about_page.team.members.3.desc",
    image: CTO2,
  },
];

const scrollRevealVariants: Variants = {
  hidden: { opacity: 0, y: 100, scale: 0.9, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const TeamSection: React.FC = () => {
  const { t } = useTranslation();

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
      (prev) => (prev - 1 + TEAM_MEMBERS.length) % TEAM_MEMBERS.length,
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
    <section className="relative py-24 md:py-32 bg-[#0a0a0a] overflow-hidden font-noto text-white border-t border-[rgba(255,255,255,0.05)] selection:bg-[rgba(216,201,123,0.3)]">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-150 h-150 bg-[rgba(216,201,123,0.05)] rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-0 left-0 w-125 h-125 bg-[rgba(216,201,123,0.05)] rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <motion.div
          variants={scrollRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          className="relative text-center mb-16 md:mb-24"
        >
          <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-4 leading-snug">
            {t("about_page.team.title")}{" "}
            <span className="inline-block pt-2 pb-2 leading-normal text-transparent bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#E5D588]">
              {t("about_page.team.highlight")}
            </span>
          </h2>
          <p className="text-gray-400 italic text-lg font-light max-w-2xl mx-auto">
            {t("about_page.team.subtitle")}
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
              className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-150"
            >
              <div className="lg:col-span-5 relative group order-2 lg:order-1 ">
                <div className="absolute top-4 -left-4 w-full h-full border border-[rgba(216,201,123,0.3)] rounded-br-[40px] z-0 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2" />
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[rgba(216,201,123,0.1)] z-0"></div>

                <div className="relative h-112.5 md:h-137.5 w-full rounded-br-[60px] overflow-hidden shadow-2xl z-10">
                  <motion.img
                    src={currentMember.image}
                    alt={currentMember.name}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[rgba(10,10,10,0)] to-[rgba(10,10,10,0)] opacity-60"></div>
                </div>
              </div>

              <div className="lg:col-span-7 relative order-1 lg:order-2 flex flex-col justify-center">
                <h2 className="absolute -top-10 -left-10 text-8xl md:text-9xl font-black text-[rgba(255,255,255,0.05)] uppercase select-none pointer-events-none whitespace-nowrap z-0">
                  {currentMember.name.split(" ").pop()}
                </h2>

                <div className="relative z-10 pl-4 md:pl-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-px w-12 bg-[#D8C97B]"></div>
                    <span className="text-[#D8C97B] font-bold tracking-widest uppercase text-sm">
                      {t(currentMember.roleKey as any)}
                    </span>
                  </div>

                  <h3 className="text-4xl md:text-6xl font-bold text-white uppercase mb-8 leading-tight drop-shadow-lg">
                    {currentMember.name}
                  </h3>

                  <div className="relative mb-8">
                    <FaQuoteLeft className="text-[#D8C97B] text-3xl mb-4 opacity-80" />
                    <p className="text-xl md:text-2xl text-gray-200 font-light italic leading-relaxed">
                      "{t(currentMember.quoteKey as any)}"
                    </p>
                  </div>

                  <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl mb-10 border-l border-[rgba(255,255,255,0.1)] pl-6 text-justify">
                    {t(currentMember.descKey as any)}
                  </p>

                  <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.1)] pt-8 mt-4">
                    <div className="flex gap-4">
                      {TEAM_MEMBERS.map((member, idx) => (
                        <button
                          key={member.id}
                          onClick={() => handleSelect(idx)}
                          className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 transition-all duration-300 ${idx === currentIndex ? "border-[#D8C97B] scale-110 shadow-[0_0_15px_rgba(181,166,95,0.4)]" : "border-[rgba(216,201,123,0)] opacity-50 hover:opacity-100 hover:border-[rgba(255,255,255,0.3)]"}`}
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
                        className="w-12 h-12 rounded-full border border-[rgba(255,255,255,0.1)] flex items-center justify-center hover:bg-[#D8C97B] hover:text-black transition-all group"
                      >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="w-12 h-12 rounded-full border border-[rgba(255,255,255,0.1)] flex items-center justify-center hover:bg-[#D8C97B] hover:text-black transition-all group"
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
