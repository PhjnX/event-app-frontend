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
    title: "NGỌN LỬA KHỞI NGUỒN",
    desc: "Webie Vietnam ra đời trong bối cảnh thị trường marketing bão hòa. Nhận thấy sự thiếu vắng những giải pháp chuyển đổi số thực sự tối ưu.",
    icon: <FaFire />,
  },
  {
    year: "2024",
    title: "THÀNH LẬP CHÍNH THỨC",
    desc: "Bước ra ánh sáng với tư cách một agency chuyên nghiệp. Chuyển mình từ ý tưởng khởi điểm thành một tổ chức vận hành bài bản.",
    icon: <FaCheckCircle />,
  },
  {
    year: "2025",
    title: "VĂN PHÒNG ĐẦU TIÊN",
    desc: "Khai trương trụ sở chính - Trung tâm kết nối giữa nhân hiệu, năng lực công nghệ và niềm tin của khách hàng.",
    icon: <FaBuilding />,
  },
  {
    year: "FUTURE",
    title: "VƯƠN TẦM QUỐC TẾ",
    desc: "Mở rộng quy mô, đưa giải pháp EdTech Event của Việt Nam ghi dấu ấn trên bản đồ công nghệ khu vực.",
    icon: <FaGlobeAsia />,
  },
];

const TimelineSection = () => {
  return (
    <section className="relative py-32 bg-[#0a0a0a] overflow-hidden font-noto text-white">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[800px] bg-[#D8C97B]/5 rounded-full blur-[120px]"></div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          className="text-center mb-24"
        >
          <span className="text-[#D8C97B] text-sm tracking-[0.3em] uppercase font-bold border-b border-[#D8C97B] pb-1">
            Lịch Sử Hình Thành
          </span>
          <h2 className="text-4xl md:text-5xl font-black uppercase text-white mt-6 mb-4 tracking-wide drop-shadow-lg">
            HÀNH TRÌNH <span className="text-[#D8C97B]">VƯƠN XA</span>
          </h2>
          <p className="text-gray-400 italic text-lg font-light">
            "Mỗi cột mốc là một bước trưởng thành vững chắc."
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-white/10 -translate-x-1/2 md:block hidden"></div>
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10 md:hidden block"></div>

          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: false }}
            transition={{ duration: 2.5, ease: "linear" }}
            className="absolute left-6 md:left-1/2 top-0 w-0.5 bg-linear-to-b from-[#D8C97B] via-[#F4D03F] to-[#D8C97B] -translate-x-1/2 origin-top shadow-[0_0_10px_#D8C97B]"
          ></motion.div>

          <div className="space-y-12 md:space-y-24">
            {TIMELINE_DATA.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row items-center ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex-1 w-full pl-20 md:pl-0 
                      ${isEven ? "md:pl-24" : "md:pr-24"}
                    `}
                  >
                    <motion.div
                      whileHover={{ y: -5, borderColor: "#D8C97B" }}
                      className={`relative p-6 md:p-8 rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-300 group
                            ${
                              isEven ? "md:text-left" : "md:text-right"
                            } text-left
                        `}
                    >
                      <span
                        className={`absolute -bottom-10 md:-bottom-6 text-4xl md:text-5xl font-black text-white/10 z-0 select-none tracking-widest pointer-events-none ${
                          isEven ? "right-4" : "left-4"
                        }`}
                      >
                        {item.year}
                      </span>

                      <div
                        className={`relative z-10 flex flex-col mb-4 ${
                          isEven ? "md:items-start" : "md:items-end"
                        }`}
                      >
                        <span className="text-[#D8C97B] font-bold text-3xl mb-1 drop-shadow-md font-noto">
                          {item.year}
                        </span>
                        <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide group-hover:text-[#D8C97B] transition-colors">
                          {item.title}
                        </h3>
                      </div>

                      <p className="relative z-10 text-gray-400 text-sm md:text-base leading-relaxed">
                        {item.desc}
                      </p>

                      <div
                        className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#1a1a1a] border-t border-r border-white/10 rotate-45 transition-colors group-hover:border-[#D8C97B]
                            ${
                              isEven
                                ? "-left-[9px] border-r-0 border-t-0 border-b border-l"
                                : "-right-[9px]"
                            }
                        `}
                      ></div>
                    </motion.div>
                  </div>

                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#D8C97B] bg-[#0a0a0a] z-20 shadow-[0_0_20px_rgba(181,166,95,0.5)] group">
                    <div className="text-[#D8C97B] text-lg">{item.icon}</div>
                  </div>

                  <div className="flex-1 hidden md:block"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
