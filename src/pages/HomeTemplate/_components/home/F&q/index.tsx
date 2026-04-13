import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function FAQSection() {
  const { t, i18n } = useTranslation();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIdx(openIdx === i ? null : i);

  const faqData = t("home.faq.items", { returnObjects: true }) as {
    q: string;
    a: string;
  }[];

  return (
    <section className="relative py-24 bg-[#050505] overflow-hidden text-white font-noto">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-size-[20px_20px] opacity-[0.05] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-4xl">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4">
            <span className="text-white">{t("home.faq.title")}</span>{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#FFEBB5]">
              {t("home.faq.highlight")}
            </span>
          </h2>
          <p className="text-zinc-500 text-lg font-light max-w-xl mx-auto">
            {t("home.faq.description")}
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            visible: { transition: { staggerChildren: 0.07 } },
          }}
        >
          {Array.isArray(faqData) &&
            faqData.map((item, i) => {
              const isOpen = openIdx === i;
              return (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-[#D8C97B]/40 bg-linear-to-br from-[#1e1c12]/90 to-[#141310]/95 shadow-[0_8px_40px_rgba(216,201,123,0.07),inset_0_1px_0_rgba(216,201,123,0.08)]"
                      : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/80"
                  }`}
                >
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center gap-4 px-6 py-5.5 text-left cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`text-[10px] font-extrabold tracking-[0.15em] min-w-5.5 hidden sm:block transition-colors duration-300 ${
                        isOpen ? "text-[#D8C97B]/80" : "text-[#D8C97B]/35"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={`flex-1 text-sm md:text-base font-semibold leading-snug transition-colors duration-300 ${
                        isOpen ? "text-[#ede8c4]" : "text-zinc-300"
                      }`}
                    >
                      {item.q}
                    </span>

                    <span
                      className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen
                          ? "bg-[#D8C97B]/10 border-[#D8C97B]/45 rotate-45"
                          : "border-zinc-700 hover:border-zinc-500"
                      }`}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke={isOpen ? "#D8C97B" : "#71717a"}
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <line x1="6" y1="1" x2="6" y2="11" />
                        <line x1="1" y1="6" x2="11" y2="6" />
                      </svg>
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 sm:pl-14.5 text-zinc-400 text-sm leading-[1.85] border-t border-white/5 pt-4">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
        </motion.div>
      </div>

      {Array.isArray(faqData) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqData.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.a,
                },
              })),
            }),
          }}
        />
      )}
    </section>
  );
}
