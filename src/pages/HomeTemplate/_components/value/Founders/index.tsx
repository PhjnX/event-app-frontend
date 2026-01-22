import React from "react";
import { motion, type Variants } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";
  import { useTranslation, Trans } from "react-i18next";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: "easeOut" },
  },
};

const FoundersPledge: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-32 bg-[#0a0a0a] font-noto text-white relative overflow-hidden selection:bg-[rgba(216,201,123,0.3)]">
      <style>{`
        .font-signature {
          font-family: 'Great Vibes', cursive;
        }
      `}</style>

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

      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.4 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 p-10 md:p-16 rounded-3xl relative text-center shadow-2xl"
        >
          <FaQuoteLeft className="text-4xl text-[#D8C97B] mx-auto mb-8 opacity-80" />

          <h3 className="text-2xl md:text-3xl font-light italic leading-relaxed text-gray-200 mb-10">
            "
            <Trans
              i18nKey="value_page.founders_pledge.quote"
              components={{
                0: <strong className="text-white font-bold" />,
                2: <strong className="text-white font-bold" />,
              }}
            />
            "
          </h3>

          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <span className="font-signature text-6xl md:text-7xl text-[#D8C97B] opacity-90 rotate-[-5deg] block pr-4 select-none">
                {t("value_page.founders_pledge.signature")}
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full h-8 text-[#D8C97B] opacity-70 -rotate-2"
                viewBox="0 0 200 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 10 C 50 20, 150 20, 190 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="text-center mt-6">
              <h4 className="text-xl font-bold uppercase tracking-wide">
                {t("value_page.founders_pledge.name")}
              </h4>
              <p className="text-[#D8C97B] text-xs font-bold tracking-[0.2em] uppercase mt-1">
                {t("value_page.founders_pledge.role")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FoundersPledge;
