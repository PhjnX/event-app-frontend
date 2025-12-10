import React from "react";
import { motion, type Variants } from "framer-motion";

import cultureImage1 from "@/assets/images/culture_1.jpg";
import cultureImage2 from "@/assets/images/culture_2.jpg";
import cultureImage3 from "@/assets/images/culture_3.jpg";
import cultureImage4 from "@/assets/images/culture_4.jpg";
import cultureImage6 from "@/assets/images/culture_6.jpg";

const CULTURE_IMAGES = [
  cultureImage1,
  cultureImage2,
  cultureImage3,
  cultureImage4,
  cultureImage6,
];

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
  return (
    <section className="py-24 bg-[#0a0a0a] font-noto text-white border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 mb-16 relative z-10">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          className="text-center"
        >
          <span className="text-[#D8C97B] text-xs font-bold tracking-[0.3em] uppercase border-b border-[#D8C97B] pb-1 mb-4 inline-block hover:text-white transition-colors">
            Our Culture
          </span>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-wide mb-6">
            WEBIE <span className="text-[#D8C97B]">DNA</span>
          </h2>
          <p className="text-gray-400 italic text-lg max-w-2xl mx-auto hover:text-white transition-colors duration-300">
            "Chúng tôi không chỉ viết code, chúng tôi xây dựng cộng đồng những
            người đam mê sáng tạo."
          </p>
        </motion.div>
      </div>

      <div className="relative w-full overflow-hidden mt-10">
        <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>

        <motion.div
          className="flex gap-6 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {[
            ...CULTURE_IMAGES,
            ...CULTURE_IMAGES,
            ...CULTURE_IMAGES,
            ...CULTURE_IMAGES,
          ].map((src, index) => (
            <div
              key={index}
              className="relative w-[300px] md:w-[450px] h-[250px] md:h-[350px] rounded-2xl overflow-hidden group cursor-pointer border border-white/10"
            >
              <img
                src={src}
                alt="Culture"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CultureSection;
