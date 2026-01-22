import { motion, type Variants } from "framer-motion";
import c1 from "../../../../../assets/images/partner_1.webp";
import c2 from "../../../../../assets/images/partner_2.webp";
import c3 from "../../../../../assets/images/partner_3.webp";
import c4 from "../../../../../assets/images/partner_4.webp";
import c5 from "../../../../../assets/images/partner_5.webp";
import c6 from "../../../../../assets/images/partner_6.webp";
import c7 from "../../../../../assets/images/partner_7.webp";
import c8 from "../../../../../assets/images/partner_8.webp";
import c9 from "../../../../../assets/images/partner_9.webp";
import { useTranslation } from "react-i18next";

interface Partner {
  id: number;
  logo: string;
  name: string;
}

const partners: Partner[] = [
  { id: 1, logo: c1, name: "Minh Nguyen Design" },
  { id: 2, logo: c2, name: "Ogawa" },
  { id: 3, logo: c3, name: "CTBCN Engineering" },
  { id: 4, logo: c4, name: "Partner 4" },
  { id: 5, logo: c5, name: "Partner 5" },
  { id: 6, logo: c6, name: "Partner 6" },
  { id: 7, logo: c7, name: "Partner 7" },
  { id: 8, logo: c8, name: "Partner 8" },
  { id: 9, logo: c9, name: "Partner 9" },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const revealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: "blur(10px)",
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const sloganVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: "easeOut", delay: 0.2 },
  },
};

const BackgroundDecoration = () => (
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
);

export default function CustomerSection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-28 bg-[#0a0a0a] overflow-hidden font-noto text-white selection:bg-[rgba(216,201,123,0.3)]">
      <BackgroundDecoration />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="relative mb-24"
        >
          <motion.div variants={revealVariants} className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.3em] text-gray-500 uppercase border border-white/10 px-6 py-3 rounded-full backdrop-blur-md bg-white/5">
              {t("about_page.customer_section.trusted_by")}
            </span>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-16 items-center justify-items-center">
            {partners.map((partner) => (
              <motion.div
                key={partner.id}
                variants={revealVariants}
                className="group w-full flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-500 opacity-50 hover:opacity-100 cursor-pointer"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-12 md:max-h-16 w-auto object-contain transform group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                />
              </motion.div>
            ))}

            <motion.div
              variants={revealVariants}
              className="flex flex-col items-center justify-center opacity-40 hover:opacity-80 transition-opacity duration-300"
            >
              <div className="flex gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 bg-[#D8C97B] rounded-full animate-pulse"></span>
                <span className="w-1.5 h-1.5 bg-[#D8C97B] rounded-full animate-pulse delay-75"></span>
                <span className="w-1.5 h-1.5 bg-[#D8C97B] rounded-full animate-pulse delay-150"></span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#D8C97B]">
                {t("about_page.customer_section.more")}
              </span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          className="relative text-center border-t border-white/5 pt-24"
        >
          <div className="absolute top-0 left-0 w-px h-24 bg-linear-to-b from-transparent via-[#D8C97B]/50 to-transparent"></div>
          <div className="absolute top-0 right-0 w-px h-24 bg-linear-to-b from-transparent via-[#D8C97B]/50 to-transparent"></div>

          <motion.h2
            variants={sloganVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-noto font-black text-[#D8C97B] tracking-wide mb-8 drop-shadow-2xl"
          >
            {t("about_page.customer_section.slogan.title")}
          </motion.h2>

          <motion.div
            variants={revealVariants}
            className="max-w-3xl mx-auto space-y-4"
          >
            <p className="text-xl md:text-2xl text-white font-medium">
              {t("about_page.customer_section.slogan.main")}
            </p>
            <p className="text-base md:text-lg text-gray-500 font-light italic">
              {t("about_page.customer_section.slogan.sub")}
            </p>
          </motion.div>

          <motion.div
            variants={revealVariants}
            className="mt-16 flex justify-center items-center gap-6 opacity-30"
          >
            <div className="h-px w-24 bg-white"></div>
            <span className="text-xs tracking-[0.3em] uppercase font-bold">
              {t("about_page.customer_section.slogan.since")}
            </span>
            <div className="h-px w-24 bg-white"></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
