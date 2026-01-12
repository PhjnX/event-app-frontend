import React from "react";
import { motion } from "framer-motion";
import { FaFire, FaBuilding, FaGlobeAsia, FaCheckCircle } from "react-icons/fa";

interface TimelineItem {
  year: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

const TIMELINE_DATA: TimelineItem[] = [
  {
    year: "2022",
    title: "KHỞI NGUỒN",
    desc: "Webie Vietnam ra đời, mang đến giải pháp chuyển đổi số thực chiến.",
    icon: <FaFire />,
  },
  {
    year: "2024",
    title: "THÀNH LẬP",
    desc: "Chuyển mình thành Agency chuyên nghiệp với quy trình vận hành bài bản.",
    icon: <FaCheckCircle />,
  },
  {
    year: "2025",
    title: "TRỤ SỞ CHÍNH",
    desc: "Khai trương văn phòng - Trung tâm kết nối nhân hiệu và công nghệ.",
    icon: <FaBuilding />,
  },
  {
    year: "FUTURE",
    title: "VƯƠN TẦM",
    desc: "Mở rộng quy mô, ghi dấu ấn EdTech Event trên bản đồ khu vực.",
    icon: <FaGlobeAsia />,
  },
];

const TimelineSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="relative py-20 lg:py-28 bg-[#0a0a0a] overflow-hidden font-sans text-white selection:bg-[#D8C97B] selection:text-black">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[400px] bg-[rgba(216,201,123,0.08)] rounded-full blur-[100px]"></div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.8) 1px, rgba(0,0,0,0) 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative text-center mb-10 lg:mb-16"
        >
          <h2 className="text-3xl lg:text-6xl font-black uppercase text-white mt-4 mb-4 tracking-wide drop-shadow-lg font-noto">
            HÀNH TRÌNH <span className="text-[#D8C97B]">VƯƠN XA</span>
          </h2>
          <p className="text-gray-400 text-lg font-noto mx-auto max-w-2xl">
            Vươn mình trong hành trình chuyển đổi số sự kiện cùng Webie Vietnam.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="relative"
        >
          {/* LINES */}
          <div className="hidden lg:block absolute top-6 left-0 right-0 h-0.5 bg-[rgba(255,255,255,0.1)]">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-linear-to-r from-[#D8C97B] via-[#F4D03F] to-[#D8C97B] shadow-[0_0_15px_#D8C97B]"
            ></motion.div>
          </div>

          <div className="block lg:hidden absolute left-[19px] top-0 bottom-0 w-0.5 bg-[rgba(255,255,255,0.1)]">
            <motion.div
              initial={{ height: "0%" }}
              whileInView={{ height: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full bg-linear-to-b from-[#D8C97B] via-[#F4D03F] to-[#D8C97B] shadow-[0_0_15px_#D8C97B]"
            ></motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-4">
            {TIMELINE_DATA.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative flex lg:flex-col lg:items-center pl-16 lg:pl-0 group"
              >
                {/* ICON */}
                <div className="absolute lg:relative left-0 lg:left-auto top-0 lg:top-auto z-20">
                  <div className="flex items-center justify-center w-10 h-10 lg:w-[50px] lg:h-[50px] rounded-full border-2 border-[#D8C97B] bg-[#0a0a0a] shadow-[0_0_15px_rgba(216,201,123,0.4)] group-hover:scale-110 group-hover:bg-[#D8C97B] group-hover:text-black transition-all duration-300">
                    <div className="text-[#D8C97B] lg:text-xl text-lg group-hover:text-black transition-colors">
                      {item.icon}
                    </div>
                  </div>
                </div>

                <div className="lg:mt-5 lg:text-center w-full">
                  <motion.div
                    initial={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
                    whileHover={{ y: -5, borderColor: "#D8C97B" }}
                    className="p-5 lg:p-6 rounded-xl bg-[rgba(30,30,30,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.08)] transition-all duration-300 shadow-lg"
                  >
                    <div className="inline-block px-3 py-1 mb-3 rounded-full bg-[rgba(216,201,123,0.1)] border border-[rgba(216,201,123,0.2)] text-[#D8C97B] text-xs font-bold tracking-wider">
                      {item.year}
                    </div>

                    <h3 className="text-lg lg:text-xl font-bold text-white uppercase mb-2 group-hover:text-[#D8C97B] transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>

                  <div className="hidden lg:block absolute top-5 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-linear-to-b from-[#D8C97B] to-transparent opacity-50"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TimelineSection;
