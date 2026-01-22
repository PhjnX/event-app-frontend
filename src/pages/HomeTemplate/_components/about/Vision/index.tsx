import { motion, type Variants } from "framer-motion";
import { FaEye, FaBullseye, FaCheck } from "react-icons/fa";
import { useTranslation, Trans } from "react-i18next";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const VisionSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-32 bg-[#0a0a0a] overflow-hidden font-noto text-white selection:bg-[rgba(216,201,123,0.3)]">
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          className="relative text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase text-[#D8C97B] mt-6 mb-4 tracking-wide drop-shadow-lg">
            {t("about_page.vision.title")}{" "}
            <span className="text-[#D8C97B]">{t("about_page.vision.and")}</span>{" "}
            <span className="text-white">{t("about_page.vision.mission")}</span>
          </h2>

          <p className="text-gray-400 text-lg font-light max-w-3xl mx-auto">
            {t("about_page.vision.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="group relative h-full"
          >
            <div className="absolute -inset-0.5 bg-linear-to-r from-[#D8C97B] to-[#F4E2A6] rounded-3xl opacity-0 group-hover:opacity-30 blur-lg transition duration-500"></div>

            <div className="relative h-full bg-[#111] rounded-3xl p-8 md:p-12 border border-white/10 group-hover:border-[#D8C97B]/50 overflow-hidden transition-all duration-500 flex flex-col">
              <span className="absolute top-0 right-0 p-6 text-9xl font-black text-white/5 select-none font-noto transition-transform duration-700 group-hover:scale-110 group-hover:text-white/10">
                01
              </span>

              <div className="w-16 h-16 rounded-2xl bg-[#D8C97B]/10 border border-[#D8C97B]/20 flex items-center justify-center mb-8 group-hover:bg-[#D8C97B] group-hover:shadow-[0_0_20px_#D8C97B] transition-all duration-300">
                <FaEye className="text-2xl text-[#D8C97B] group-hover:text-black transition-colors" />
              </div>

              <h4 className="text-3xl font-black text-white uppercase mb-6 tracking-wide group-hover:text-[#D8C97B] transition-colors relative z-10">
                {t("about_page.vision.vision_card.title")}
              </h4>

              <p className="text-gray-400 text-lg leading-relaxed font-light relative z-10 grow">
                <Trans
                  i18nKey="about_page.vision.vision_card.desc"
                  components={{
                    0: <strong className="text-white font-medium" />,
                  }}
                />
              </p>

              <div className="mt-8 h-1 w-12 bg-[#D8C97B] group-hover:w-full transition-all duration-500 ease-out"></div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.2 }}
            className="group relative h-full"
          >
            <div className="absolute -inset-0.5 bg-linear-to-r from-blue-600 to-blue-400 rounded-3xl opacity-0 group-hover:opacity-30 blur-lg transition duration-500"></div>

            <div className="relative h-full bg-[#111] rounded-3xl p-8 md:p-12 border border-white/10 group-hover:border-blue-500/50 overflow-hidden transition-all duration-500 flex flex-col">
              <span className="absolute top-0 right-0 p-6 text-9xl font-black text-white/5 select-none font-noto transition-transform duration-700 group-hover:scale-110 group-hover:text-white/10">
                02
              </span>

              <div className="w-16 h-16 rounded-2xl bg-blue-900/20 border border-blue-500/30 flex items-center justify-center mb-8 group-hover:bg-blue-500 group-hover:shadow-[0_0_20px_#3b82f6] transition-all duration-300">
                <FaBullseye className="text-2xl text-blue-400 group-hover:text-white transition-colors" />
              </div>

              <h4 className="text-3xl font-black text-white uppercase mb-6 tracking-wide group-hover:text-blue-400 transition-colors relative z-10">
                {t("about_page.vision.mission_card.title")}
              </h4>

              <p className="text-gray-400 text-lg leading-relaxed font-light mb-8 relative z-10">
                {t("about_page.vision.mission_card.desc")}
              </p>

              <div className="relative z-10 mt-auto">
                <ul className="space-y-4">
                  {[
                    "about_page.vision.mission_card.values.1",
                    "about_page.vision.mission_card.values.2",
                    "about_page.vision.mission_card.values.3",
                  ].map((key, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-4 text-gray-300 text-sm font-medium group/item"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30 group-hover/item:bg-blue-500 transition-colors">
                        <FaCheck className="text-blue-400 text-[10px] group-hover/item:text-white" />
                      </div>
                      <span className="group-hover/item:text-white transition-colors">
                        {t(key as any)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 h-1 w-12 bg-blue-500 group-hover:w-full transition-all duration-500 ease-out"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
