import React, { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useTransform,
  type Variants,
} from "framer-motion";

import cultureImage1 from "@/assets/images/culture_1.webp";
import cultureImage2 from "@/assets/images/culture_2.webp";
import cultureImage3 from "@/assets/images/culture_3.jpg";
import cultureImage4 from "@/assets/images/culture_4.webp";
import cultureImage6 from "@/assets/images/culture_6.webp";

const CULTURE_IMAGES = [
  cultureImage1,
  cultureImage2,
  cultureImage3,
  cultureImage4,
  cultureImage6,
];

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8 },
  },
};

const CultureSection: React.FC = () => {
  const baseX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Logic tự động chạy Marquee
  useAnimationFrame((_t, delta) => {
    if (!isDragging) {
      const moveBy = -0.003 * delta;
      baseX.set(baseX.get() + moveBy);
    }
  });

  // Logic xử lý khi người dùng kéo (Pan)
  const handlePan = (_e: any, info: any) => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const percentMove = (info.delta.x / containerWidth) * 100 * 1.5;
      baseX.set(baseX.get() + percentMove);
    }
  };

  const x = useTransform(baseX, (v) => `${wrap(0, -50, v)}%`);

  return (
    <section className="py-24 bg-[#0a0a0a] font-noto text-white border-t border-[rgba(255,255,255,0.05)] overflow-hidden selection:bg-[rgba(216,201,123,0.3)]">
      {/* 1. HEADER SECTION */}
      <div className="container mx-auto px-4 mb-16 relative z-10">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-wide mb-6">
            WEBIE <span className="text-[#D8C97B]">DNA</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto hover:text-white transition-colors duration-300 font-light">
            Chúng tôi không chỉ viết code, chúng tôi xây dựng cộng đồng những
            người đam mê sáng tạo
          </p>
        </motion.div>
      </div>

      <div className="relative w-full overflow-hidden mt-10">
        <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-[#0a0a0a] to-[rgba(10,10,10,0)] z-20 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-[#0a0a0a] to-[rgba(10,10,10,0)] z-20 pointer-events-none"></div>

        <motion.div
          ref={containerRef}
          className="flex gap-6 w-max cursor-grab active:cursor-grabbing"
          style={{ x }}
          onPanStart={() => setIsDragging(true)}
          onPan={handlePan}
          onPanEnd={() => setIsDragging(false)}
        >
          {[
            ...CULTURE_IMAGES,
            ...CULTURE_IMAGES,
            ...CULTURE_IMAGES,
            ...CULTURE_IMAGES,
          ].map((src, index) => (
            <div
              key={index}
              className="relative w-[300px] md:w-[450px] h-[250px] md:h-[350px] rounded-2xl overflow-hidden group border border-[rgba(255,255,255,0.1)] select-none shadow-xl"
            >
              <img
                src={src}
                alt="Culture"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 pointer-events-none"
              />

              <div className="absolute inset-0 bg-[rgba(0,0,0,0.25)] group-hover:bg-[rgba(0,0,0,0)] transition-colors duration-500 pointer-events-none"></div>

              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[rgba(216,201,123,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"></div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CultureSection;
