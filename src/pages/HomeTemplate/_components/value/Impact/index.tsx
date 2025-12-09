import React from "react";
import { motion, useSpring, useInView, type Variants } from "framer-motion";

interface StatItem {
  id: number;
  value: number;
  suffix: string;
  label: string;
}

const STATS: StatItem[] = [
  { id: 1, value: 5, suffix: "+", label: "Năm kinh nghiệm" },
  { id: 2, value: 150, suffix: "+", label: "Dự án thành công" },
  { id: 3, value: 50, suffix: "+", label: "Đối tác chiến lược" },
  { id: 4, value: 99, suffix: "%", label: "Tỉ lệ hài lòng" },
];

const NumberCounter = ({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 }); // Reset khi scroll
  const springValue = useSpring(0, { bounce: 0, duration: 2000 });

  React.useEffect(() => {
    if (isInView) {
      springValue.set(value);
    } else {
      springValue.set(0); // Reset về 0 khi scroll đi
    }
  }, [isInView, value, springValue]);

  // Sync motion value to DOM text
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
      <span className="text-[#B5A65F] ml-1">{suffix}</span>
    </div>
  );
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, filter: "blur(10px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
};

const ImpactNumbers: React.FC = () => {
  return (
    <section className="py-24 bg-[#0a0a0a] font-noto text-white border-t border-white/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold uppercase mb-4">
            DẤU ẤN <span className="text-[#B5A65F]">THỰC TẾ</span>
          </h2>
          <p className="text-gray-400 italic">"Con số không biết nói dối"</p>
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
              <div className="h-[2px] w-12 bg-[#B5A65F]/50 mx-auto my-4 group-hover:w-24 transition-all duration-500"></div>
              <p className="text-gray-400 uppercase tracking-widest text-sm font-bold group-hover:text-white transition-colors">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactNumbers;
