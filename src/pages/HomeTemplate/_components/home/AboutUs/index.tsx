import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { SLIDE_DATA } from "./data";
import type { AboutSlide } from "@/pages/HomeTemplate/_components/home/models/about-slide";
import { useTranslation, Trans } from "react-i18next";

const ImageSlider = ({
  currentSlide,
  currentIndex,
}: {
  currentSlide: AboutSlide;
  currentIndex: number;
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[rgba(255,255,255,0.1)] group h-[500px] w-full bg-[#1a1a1a]">
        <div className="absolute inset-0 bg-linear-to-t from-[rgba(0,0,0,0.6)] via-[rgba(0,0,0,0)] to-[rgba(0,0,0,0)] z-10 pointer-events-none"></div>

        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide.id}
            src={currentSlide.image}
            alt={t(currentSlide.label as any)}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>

      <div className="absolute -bottom-10 -right-4 md:-right-12 z-20 w-72">
        <div className="relative bg-[rgba(15,15,15,0.95)] backdrop-blur-xl p-6 rounded-xl border border-[rgba(255,255,255,0.1)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <motion.div
            animate={{ backgroundColor: "#D8C97B" }}
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
                  className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-lg"
                  style={{ color: "#D8C97B" }}
                >
                  {currentSlide.icon}
                </div>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                  {t(currentSlide.label as any)}
                </span>
              </div>
              <h3 className="text-white text-xl font-bold leading-tight mb-1">
                {t(currentSlide.title as any)}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 font-light">
                {t(currentSlide.desc as any)}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[rgba(255,255,255,0.1)]">
            <motion.div
              key={currentIndex}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              style={{ backgroundColor: "#D8C97B" }}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ContentSection = () => {
  const { t } = useTranslation();

  return (
    <div className="pl-0 lg:pl-10 relative mt-4">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed text-justify font-light">
          <Trans
            i18nKey="home.about.content.text"
            components={{
              0: (
                <span className="text-5xl font-bold text-[#D8C97B] float-left mr-3 leading-[0.8] mt-2 font-noto" />
              ),
              2: (
                <span className="text-white font-medium border-b border-[#D8C97B]" />
              ),
              4: (
                <span className="text-white font-medium border-b border-[#D8C97B]" />
              ),
            }}
          />
        </p>

        <div className="flex gap-8 mb-10 border-t border-[rgba(255,255,255,0.1)] pt-6">
          {[
            { value: "50+", label: t("home.about.content.stats.projects") },
            {
              value: "100%",
              label: t("home.about.content.stats.satisfaction"),
            },
            { value: "24/7", label: t("home.about.content.stats.support") },
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
            className="group/btn relative inline-flex items-center gap-3 px-8 py-3.5 bg-[rgba(0,0,0,0)] text-[#D8C97B] font-bold text-sm uppercase tracking-wider rounded-full border border-[#D8C97B] overflow-hidden transition-all duration-300 hover:bg-[#D8C97B] hover:text-black hover:shadow-[0_0_30px_rgba(181,166,95,0.4)]"
          >
            <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-[rgba(255,255,255,0)] via-[rgba(255,255,255,0.5)] to-[rgba(255,255,255,0)] -skew-x-12 z-10 animate-shine-infinite group-hover/btn:animate-shine-fast" />
            <span className="relative z-20 flex items-center gap-2">
              {t("home.about.content.btn_more")}{" "}
              <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform duration-300" />
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

const AboutSection = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDE_DATA.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = SLIDE_DATA[currentIndex];

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden text-white font-noto group-section selection:bg-[rgba(216,201,123,0.3)]">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.15) 1px, rgba(0, 0, 0, 0) 1px)",
          backgroundSize: "30px 30px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0), black 15%, black 85%, rgba(0,0,0,0))",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0), black 15%, black 85%, rgba(0,0,0,0))",
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-2xl uppercase tracking-tight font-noto"
          >
            {t("home.about.title")}{" "}
            <span className="text-[#D8C97B] block md:inline">
              {t("home.about.subtitle")}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base md:text-xl text-gray-400 leading-relaxed max-w-3xl drop-shadow-md mx-auto font-light"
          >
            {t("home.about.description")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <ImageSlider
            currentSlide={currentSlide}
            currentIndex={currentIndex}
          />
          <ContentSection />
        </div>
      </div>

      <style>{`
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
