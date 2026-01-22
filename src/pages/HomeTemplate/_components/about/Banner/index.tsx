import { motion, useScroll, useTransform } from "framer-motion";
import banner from "../../../../../assets/images/banner.webp";
import { useTranslation } from "react-i18next";

const HERO_IMAGE = banner;

const AboutHero = () => {
  const { t } = useTranslation();

  const { scrollY } = useScroll();

  const backgroundY = useTransform(scrollY, [0, 1000], ["0%", "30%"]);
  const textY = useTransform(scrollY, [0, 1000], ["0%", "100%"]);
  const textOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const textScale = useTransform(scrollY, [0, 500], [1, 0.9]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#0a0a0a] flex items-center justify-center font-noto selection:bg-[rgba(216,201,123,0.3)] selection:text-black">
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 z-0">
        <img
          src={HERO_IMAGE}
          alt="Event Manager System Background"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.7)] z-10" />
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[rgba(10,10,10,0)] to-[rgba(10,10,10,0.4)] z-20" />
        <div
          className="absolute inset-0 z-30 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1.5px, rgba(255,255,255,0) 1.5px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </motion.div>

      <div className="relative z-40 container mx-auto px-4 flex flex-col items-center justify-center h-full">
        <motion.div
          style={{ y: textY, opacity: textOpacity, scale: textScale }}
          className="relative text-center w-full flex flex-col items-center"
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
                {t("about_page.hero.title_first")} <br className="md:hidden" />
                <span className="text-[#D8C97B]">
                  {t("about_page.hero.title_second")}
                </span>
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
                  {t("about_page.hero.created_by")}{" "}
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
            className="relative mt-10 max-w-2xl text-center px-4"
          >
            <p className="text-gray-400 text-sm md:text-lg font-normal leading-relaxed border-t border-[rgba(255,255,255,0.1)] pt-6">
              {t("about_page.hero.description")}
            </p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-widest text-white/50 animate-pulse">
          {t("about_page.hero.scroll")}
        </span>
        <div className="relative w-px h-16 bg-[rgba(255,255,255,0.1)] overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-[rgba(216,201,123,0)] via-[#D8C97B] to-[rgba(216,201,123,0)]"
          ></motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default AboutHero;
