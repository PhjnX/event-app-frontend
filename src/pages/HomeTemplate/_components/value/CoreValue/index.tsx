import React, { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  FaLightbulb,
  FaHandshake,
  FaShieldAlt,
  FaRocket,
} from "react-icons/fa";

import valueImage1 from "@/assets/images/value_1.jpg";
import valueImage2 from "@/assets/images/value_2.jpg";
import valueImage3 from "@/assets/images/value_3.jpg";
import valueImage4 from "@/assets/images/value_4.jpg";

// --- Types ---
interface ValueItem {
  id: number;
  title: string;
  enTitle: string;
  desc: string;
  icon: React.ElementType;
  image: string;
}

const VALUES: ValueItem[] = [
  {
    id: 1,
    title: "TIÊN PHONG",
    enTitle: "INNOVATION",
    desc: "Không chấp nhận lối mòn. Chúng tôi liên tục thử nghiệm các công nghệ mới nhất (AI, Blockchain) để định hình lại tương lai của EdTech.",
    icon: FaLightbulb,
    image: valueImage1,
  },
  {
    id: 2,
    title: "TẬN TÂM",
    enTitle: "DEDICATION",
    desc: "Khách hàng là trung tâm. Chúng tôi đo lường thành công không phải bằng doanh thu, mà bằng sự hài lòng của đối tác.",
    icon: FaHandshake,
    image: valueImage2,
  },
  {
    id: 3,
    title: "CHÍNH TRỰC",
    enTitle: "INTEGRITY",
    desc: "Minh bạch trong từng cam kết, trung thực trong từng báo cáo. Webie xây dựng niềm tin bền vững bằng hành động thực tế.",
    icon: FaShieldAlt,
    image: valueImage3,
  },
  {
    id: 4,
    title: "TỐC ĐỘ",
    enTitle: "VELOCITY",
    desc: "Trong kỷ nguyên số, chậm trễ là thất bại. Chúng tôi tối ưu hóa quy trình để mang lại giải pháp nhanh nhất mà không hy sinh chất lượng.",
    icon: FaRocket,
    image: valueImage4,
  },
];

// Animation Variants (Scroll Reveal)
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8 },
  },
};

const CoreValues: React.FC = () => {
  const [activeId, setActiveId] = useState<number>(1);

  return (
    <section className="py-24 bg-[#0a0a0a] relative font-noto text-white border-t border-white/5">
      <div className="container mx-auto px-4 relative z-10 h-[700px] flex flex-col">
        {/* HEADER */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-[#B5A65F] text-xs font-bold tracking-[0.3em] uppercase border-b border-[#B5A65F] pb-1 mb-4 inline-block">
            Core Values
          </span>
          <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-wide">
            GIÁ TRỊ <span className="text-[#B5A65F]">CỐT LÕI</span>
          </h2>
          <p className="text-gray-400 mt-4 italic text-lg font-light">
            "Kim chỉ nam cho mọi hành động tại Webie Vietnam"
          </p>
        </motion.div>

        {/* ACCORDION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row gap-4 h-full w-full"
        >
          {VALUES.map((item) => {
            const isActive = activeId === item.id;
            return (
              <motion.div
                key={item.id}
                layout
                onClick={() => setActiveId(item.id)}
                onHoverStart={() => setActiveId(item.id)}
                className={`relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-700 ease-in-out group
                  ${
                    isActive
                      ? "md:flex-3 flex-3 h-[300px] md:h-auto"
                      : "md:flex-1 flex-1 h-20 md:h-auto"
                  }
                `}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover filter brightness-[0.3] group-hover:brightness-[0.4] transition-all duration-700 scale-105"
                />
                <div
                  className={`absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-black/90 transition-opacity duration-500 ${
                    isActive ? "opacity-100" : "opacity-80"
                  }`}
                ></div>

                {isActive && (
                  <motion.div
                    layoutId="activeBorder"
                    className="absolute inset-0 border-2 border-[#B5A65F] rounded-3xl z-20"
                  />
                )}

                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-10">
                  <div
                    className={`flex items-center gap-4 ${
                      isActive ? "mb-4" : "justify-center md:justify-start"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isActive
                          ? "bg-[#B5A65F] text-black"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      <item.icon className="text-xl" />
                    </div>
                    <div
                      className={`${
                        !isActive &&
                        "hidden md:block md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                      }`}
                    >
                      <h3
                        className={`font-bold uppercase leading-none ${
                          isActive
                            ? "text-2xl md:text-3xl text-white"
                            : "text-lg text-gray-400"
                        }`}
                      >
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <p className="text-gray-300 text-sm md:text-base border-l-2 border-[#B5A65F] pl-4">
                          {item.desc}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isActive && (
                    <div className="hidden md:flex absolute inset-0 items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="transform -rotate-90 text-xl font-bold tracking-widest text-gray-500 uppercase">
                        {item.enTitle}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CoreValues;
