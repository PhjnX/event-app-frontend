import React from "react";
import { motion, type Variants } from "framer-motion";
import {
  FaLightbulb,
  FaHandshake,
  FaShieldAlt,
  FaRocket,
} from "react-icons/fa";

// Import ảnh (Giữ nguyên)
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
    <section className="py-24 bg-[#0a0a0a] relative font-noto text-white overflow-hidden border-t border-white/5">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D8C97B]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-[#D8C97B] text-xs font-bold tracking-[0.3em] uppercase border-b border-[#D8C97B] pb-1 mb-4 inline-block">
            Core Values
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase text-white tracking-wide mb-6">
            GIÁ TRỊ{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#F4E2A6]">
              CỐT LÕI
            </span>
          </h2>
          <p className="text-gray-400 italic text-lg font-light max-w-2xl mx-auto">
            "Kim chỉ nam dẫn lối cho mọi hành động và quyết định tại Webie
            Vietnam"
          </p>
        </motion.div>

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
              className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500"></div>
              </div>

              <div className="absolute inset-0 border border-white/10 rounded-3xl transition-colors duration-300 group-hover:border-[#D8C97B]/50"></div>

              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#D8C97B] text-2xl group-hover:bg-[#D8C97B] group-hover:text-black transition-all duration-300 shadow-lg">
                    <item.icon />
                  </div>
                  <span className="text-6xl font-black text-white/5 group-hover:text-[#D8C97B]/10 transition-colors duration-300 select-none">
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

                  <p className="text-gray-400 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-3">
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
