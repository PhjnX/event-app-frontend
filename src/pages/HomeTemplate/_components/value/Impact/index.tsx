import React from "react";
import { motion, useSpring, useInView, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";

interface StatItem {
  id: number;
  value: number;
  suffix: string;
  labelKey: string;
}

const STATS: StatItem[] = [
  {
    id: 1,
    value: 5,
    suffix: "+",
    labelKey: "value_page.impact_numbers.stats.1",
  },
  {
    id: 2,
    value: 150,
    suffix: "+",
    labelKey: "value_page.impact_numbers.stats.2",
  },
  {
    id: 3,
    value: 50,
    suffix: "+",
    labelKey: "value_page.impact_numbers.stats.3",
  },
  {
    id: 4,
    value: 99,
    suffix: "%",
    labelKey: "value_page.impact_numbers.stats.4",
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

const NumberCounter = ({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const springValue = useSpring(0, { bounce: 0, duration: 2000 });

  React.useEffect(() => {
    if (isInView) {
      springValue.set(value);
    } else {
      springValue.set(0);
    }
  }, [isInView, value, springValue]);

  React.useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toString();
      }
    });
  }, [springValue]);

  return (
    <div className="flex items-baseline justify-center font-black text-5xl md:text-7xl text-white">
      <span ref={ref}>0</span>
      <span className="text-[#D8C97B] ml-1">{suffix}</span>
    </div>
  );
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, filter: "blur(10px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
};

const ImpactNumbers: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-[#020202] font-noto text-white border-t border-white/5 relative overflow-hidden">
      <BackgroundDecoration />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase mb-4 drop-shadow-xl">
            {t("value_page.impact_numbers.title")}{" "}
            <span className="text-[#D8C97B]">
              {t("value_page.impact_numbers.highlight")}
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t("value_page.impact_numbers.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {STATS.map((stat) => (
            <motion.div
              key={stat.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: stat.id * 0.1 }}
              className="text-center group"
            >
              <NumberCounter value={stat.value} suffix={stat.suffix} />
              <div className="h-0.5 w-12 bg-[#D8C97B]/50 mx-auto my-4 group-hover:w-24 transition-all duration-500 shadow-[0_0_10px_#D8C97B]"></div>
              <p className="text-gray-400 uppercase tracking-widest text-sm font-bold group-hover:text-white transition-colors">
                {t(stat.labelKey as any)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactNumbers;
