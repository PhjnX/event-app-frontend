import React from "react";
import { motion, type Variants } from "framer-motion";
import {
  FaLightbulb,
  FaHandshake,
  FaShieldAlt,
  FaRocket,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

import valueImage1 from "@/assets/images/value_1.webp";
import valueImage2 from "@/assets/images/value_2.webp";
import valueImage3 from "@/assets/images/value_3.webp";
import valueImage4 from "@/assets/images/value_4.webp";

interface ValueItem {
  id: number;
  titleKey: string;
  enTitleKey: string;
  descKey: string;
  icon: React.ElementType;
  image: string;
}

const VALUES: ValueItem[] = [
  {
    id: 1,
    titleKey: "value_page.core_values.items.1.title",
    enTitleKey: "value_page.core_values.items.1.en_title",
    descKey: "value_page.core_values.items.1.desc",
    icon: FaLightbulb,
    image: valueImage1,
  },
  {
    id: 2,
    titleKey: "value_page.core_values.items.2.title",
    enTitleKey: "value_page.core_values.items.2.en_title",
    descKey: "value_page.core_values.items.2.desc",
    icon: FaHandshake,
    image: valueImage2,
  },
  {
    id: 3,
    titleKey: "value_page.core_values.items.3.title",
    enTitleKey: "value_page.core_values.items.3.en_title",
    descKey: "value_page.core_values.items.3.desc",
    icon: FaShieldAlt,
    image: valueImage3,
  },
  {
    id: 4,
    titleKey: "value_page.core_values.items.4.title",
    enTitleKey: "value_page.core_values.items.4.en_title",
    descKey: "value_page.core_values.items.4.desc",
    icon: FaRocket,
    image: valueImage4,
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
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const CoreValues: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 bg-[#020202] font-noto text-white overflow-hidden selection:bg-[rgba(216,201,123,0.3)]">
      <BackgroundDecoration />

      <div className="container mx-auto px-4 relative z-10 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase text-white mb-6 leading-snug font-noto drop-shadow-xl">
            {t("value_page.core_values.title")}{" "}
            <span className="inline-block pt-2 pb-2 leading-normal text-transparent bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#F4E2A6]">
              {t("value_page.core_values.highlight")}
            </span>
          </h2>
          <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto">
            {t("value_page.core_values.subtitle")}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {VALUES.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all duration-300 border border-white/5 hover:border-[#D8C97B]/50 bg-[#0a0a0a]"
            >
              <div className="absolute inset-0">
                <img
                  alt={t(item.titleKey as any)}
                  src={item.image}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-50 group-hover:brightness-75"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500"></div>
              </div>

              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#D8C97B] text-2xl group-hover:bg-[#D8C97B] group-hover:text-black transition-all duration-300 shadow-lg">
                    <item.icon />
                  </div>
                  <span className="text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors duration-300 select-none font-noto">
                    0{item.id}
                  </span>
                </div>

                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px w-8 bg-[#D8C97B] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    <span className="text-[#D8C97B] text-xs font-bold tracking-[0.2em] uppercase">
                      {t(item.enTitleKey as any)}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black text-white mb-4 uppercase leading-none group-hover:text-[#D8C97B] transition-colors duration-300 font-noto">
                    {t(item.titleKey as any)}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-3 font-light text-justify">
                    {t(item.descKey as any)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CoreValues;
