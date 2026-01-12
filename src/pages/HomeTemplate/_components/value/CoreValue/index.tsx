import React from "react";
import { motion, type Variants } from "framer-motion";
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
    desc: "Không chấp nhận lối mòn. Chúng tôi liên tục thử nghiệm các công nghệ mới nhất (AI, Blockchain) để định hình lại tương lai.",
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
    desc: "Trong kỷ nguyên số, chậm trễ là thất bại. Tối ưu hóa quy trình để mang lại giải pháp nhanh nhất mà không hy sinh chất lượng.",
    icon: FaRocket,
    image: valueImage4,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const CoreValues: React.FC = () => {
  return (
    <section className="py-24 bg-[#0a0a0a] relative font-noto text-white overflow-hidden border-t border-[rgba(255,255,255,0.05)] selection:bg-[rgba(216,201,123,0.3)]">
      {/* 1. BACKGROUND DECORATION - FIX WARNING TRANSPARENT */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[rgba(216,201,123,0.05)] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[rgba(30,58,138,0.1)] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase text-white tracking-wide mb-6">
            GIÁ TRỊ {/* FIX: Thay text-transparent bằng rgba alpha 0 */}
            <span className="text-[rgba(0,0,0,0)] bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#F4E2A6]">
              CỐT LÕI
            </span>
          </h2>
          <p className="text-gray-400  text-lg font-light max-w-2xl mx-auto">
            Kim chỉ nam dẫn lối cho mọi hành động và quyết định tại Webie
            Vietnam
          </p>
        </motion.div>

        {/* 2. VALUES GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {VALUES.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all duration-300"
            >
              {/* Card Image & Overlay */}
              <div className="absolute inset-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[rgba(0,0,0,1)] via-[rgba(0,0,0,0.7)] to-[rgba(0,0,0,0)] opacity-90 group-hover:opacity-80 transition-opacity duration-500"></div>
              </div>

              <div className="absolute inset-0 border border-[rgba(255,255,255,0.1)] rounded-3xl transition-colors duration-300 group-hover:border-[rgba(216,201,123,0.5)]"></div>

              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-[rgba(255,255,255,0.05)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#D8C97B] text-2xl group-hover:bg-[#D8C97B] group-hover:text-black transition-all duration-300 shadow-lg">
                    <item.icon />
                  </div>
                  <span className="text-6xl font-black text-[rgba(255,255,255,0.05)] group-hover:text-[rgba(216,201,123,0.1)] transition-colors duration-300 select-none">
                    0{item.id}
                  </span>
                </div>

                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px w-8 bg-[#D8C97B] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    <span className="text-[#D8C97B] text-xs font-bold tracking-[0.2em] uppercase">
                      {item.enTitle}
                    </span>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-4 uppercase leading-none group-hover:text-[#D8C97B] transition-colors duration-300">
                    {item.title}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-3 font-light text-justify">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CoreValues;
