import React from "react";
import { motion, type Variants } from "framer-motion";
import { FaFire, FaBuilding, FaGlobeAsia, FaCheckCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface TimelineItem {
  yearKey: string;
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
}

const TIMELINE_DATA: TimelineItem[] = [
  {
    yearKey: "about_page.timeline.items.1.year",
    titleKey: "about_page.timeline.items.1.title",
    descKey: "about_page.timeline.items.1.desc",
    icon: <FaFire />,
  },
  {
    yearKey: "about_page.timeline.items.2.year",
    titleKey: "about_page.timeline.items.2.title",
    descKey: "about_page.timeline.items.2.desc",
    icon: <FaCheckCircle />,
  },
  {
    yearKey: "about_page.timeline.items.3.year",
    titleKey: "about_page.timeline.items.3.title",
    descKey: "about_page.timeline.items.3.desc",
    icon: <FaBuilding />,
  },
  {
    yearKey: "about_page.timeline.items.4.year",
    titleKey: "about_page.timeline.items.4.title",
    descKey: "about_page.timeline.items.4.desc",
    icon: <FaGlobeAsia />,
  },
];

const BackgroundDecoration = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <div
      className="absolute inset-0 opacity-[0.1]"
      style={{
        backgroundImage: `radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)`,
        backgroundSize: "30px 30px",
      }}
    />
    <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#020202]"></div>
  </div>
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const TimelineSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-20 lg:py-32 bg-[#020202] overflow-hidden font-noto text-white selection:bg-[#D8C97B] selection:text-black">
      <BackgroundDecoration />

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="text-center mb-16 lg:mb-24">
          <motion.h2
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            className="text-3xl lg:text-6xl font-black uppercase text-white mb-6 tracking-wide drop-shadow-xl font-noto"
          >
            {t("about_page.timeline.title")}{" "}
            <span className="text-[#D8C97B]">
              {t("about_page.timeline.highlight")}
            </span>
          </motion.h2>
          <motion.p
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg font-noto mx-auto max-w-2xl"
          >
            {t("about_page.timeline.subtitle")}
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className="relative"
        >
          <div className="hidden lg:block absolute top-[25px] left-0 right-0 h-0.5 bg-white/10 overflow-hidden rounded-full">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: false }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-linear-to-r from-transparent via-[#D8C97B] to-transparent shadow-[0_0_20px_#D8C97B]"
            ></motion.div>
          </div>

          <div className="block lg:hidden absolute left-[19px] top-0 bottom-0 w-0.5 bg-white/10 overflow-hidden rounded-full">
            <motion.div
              initial={{ height: "0%" }}
              whileInView={{ height: "100%" }}
              viewport={{ once: false }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-full bg-linear-to-b from-transparent via-[#D8C97B] to-transparent shadow-[0_0_20px_#D8C97B]"
            ></motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-4">
            {TIMELINE_DATA.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative flex lg:flex-col lg:items-center pl-16 lg:pl-0 group"
              >
                <div className="absolute lg:relative left-0 lg:left-auto top-0 lg:top-auto z-20">
                  <div className="flex items-center justify-center w-10 h-10 lg:w-[50px] lg:h-[50px] rounded-full border-2 border-[#D8C97B] bg-[#020202] shadow-[0_0_15px_rgba(216,201,123,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(216,201,123,0.6)] group-hover:bg-[#D8C97B] group-hover:text-black transition-all duration-300">
                    <div className="text-[#D8C97B] lg:text-xl text-lg group-hover:text-black transition-colors">
                      {item.icon}
                    </div>
                  </div>
                </div>

                <div className="lg:mt-8 lg:text-center w-full relative">
                  <div className="hidden lg:block absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-linear-to-b from-[#D8C97B] to-transparent opacity-50"></div>

                  <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 group-hover:border-[#D8C97B]/50 group-hover:bg-[#111] transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#D8C97B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="inline-block px-3 py-1 mb-4 rounded-full bg-[#D8C97B]/10 border border-[#D8C97B]/20 text-[#D8C97B] text-xs font-bold tracking-widest">
                      {t(item.yearKey as any)}
                    </div>

                    <h3 className="text-lg lg:text-xl font-bold text-white uppercase mb-3 group-hover:text-[#D8C97B] transition-colors relative z-10">
                      {t(item.titleKey as any)}
                    </h3>

                    <p className="text-gray-400 text-sm leading-relaxed font-light relative z-10 group-hover:text-gray-300">
                      {t(item.descKey as any)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TimelineSection;
