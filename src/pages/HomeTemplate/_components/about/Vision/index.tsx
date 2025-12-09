import { motion } from "framer-motion";
import { FaEye, FaBullseye, FaCheck } from "react-icons/fa";

const VisionSection = () => {
  return (
    <section className="relative py-32 bg-[#0a0a0a] overflow-hidden font-noto text-white">
      {/* 1. BACKGROUND DECOR (Đồng bộ) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Glow nền so le */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#B5A65F]/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[150px]"></div>

        {/* Pattern chấm bi */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#fff 1.5px, transparent 1.5px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* 2. HEADER (STYLE GIỐNG TIMELINE) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          className="text-center mb-24"
        >
          {/* Tagline nhỏ có gạch chân */}
          <span className="text-[#B5A65F] text-sm tracking-[0.3em] uppercase font-bold border-b border-[#B5A65F] pb-1">
            Định Hướng Chiến Lược
          </span>

          {/* Tiêu đề chính */}
          <h2 className="text-4xl md:text-5xl font-black uppercase text-[#B5A65F] mt-6 mb-4 tracking-wide drop-shadow-lg">
            TẦM NHÌN <span className="text-[#B5A65F]">&</span>{" "}
            <span className="text-white">SỨ MỆNH</span>
          </h2>

          {/* Subtitle (Quote) */}
          <p className="text-gray-400 italic text-lg font-light max-w-3xl mx-auto">
            "Chúng tôi không chỉ tổ chức sự kiện, chúng tôi kiến tạo di sản số
            cho tương lai."
          </p>
        </motion.div>

        {/* 3. CARDS CONTENT (GIỮ NGUYÊN STYLE ĐẸP) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* CARD 1: TẦM NHÌN */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -10 }}
            className="group relative bg-[#1a1a1a] rounded-3xl p-8 md:p-12 border border-white/10 overflow-hidden shadow-2xl"
          >
            {/* Background Number 01 */}
            <span className="absolute -bottom-10 -right-5 text-[12rem] font-black text-white/5 select-none transition-all group-hover:text-white/10 group-hover:scale-110 duration-700">
              01
            </span>

            <div className="absolute inset-0 bg-gradient-to-br from-[#B5A65F]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-[#B5A65F]/10 flex items-center justify-center mb-6 border border-[#B5A65F]/30 group-hover:bg-[#B5A65F] transition-all duration-300">
                <FaEye className="text-2xl text-[#B5A65F] group-hover:text-black" />
              </div>

              <h4 className="text-3xl font-black text-white uppercase mb-4 tracking-wide group-hover:text-[#B5A65F] transition-colors">
                Tầm Nhìn
              </h4>

              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Trở thành biểu tượng tiên phong trong lĩnh vực{" "}
                <strong>EdTech Event</strong> tại Đông Nam Á. Chúng tôi định
                hình lại cách con người kết nối và học tập thông qua công nghệ.
              </p>

              <div className="w-12 h-1 bg-[#B5A65F] group-hover:w-full transition-all duration-700"></div>
            </div>
          </motion.div>

          {/* CARD 2: SỨ MỆNH */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -10 }}
            className="group relative bg-[#1a1a1a] rounded-3xl p-8 md:p-12 border border-white/10 overflow-hidden shadow-2xl"
          >
            {/* Background Number 02 */}
            <span className="absolute -bottom-10 -right-5 text-[12rem] font-black text-white/5 select-none transition-all group-hover:text-white/10 group-hover:scale-110 duration-700">
              02
            </span>

            <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-blue-900/20 flex items-center justify-center mb-6 border border-blue-500/30 group-hover:bg-white transition-all duration-300">
                <FaBullseye className="text-2xl text-blue-400 group-hover:text-black" />
              </div>

              <h4 className="text-3xl font-black text-white uppercase mb-4 tracking-wide group-hover:text-blue-400 transition-colors">
                Sứ Mệnh
              </h4>

              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Xây dựng hệ sinh thái số toàn diện, giúp các tổ chức giáo dục
                tối ưu vận hành và nâng cao trải nghiệm người dùng.
              </p>

              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-400 text-sm font-light">
                  <FaCheck className="text-blue-400 text-xs" /> Đổi mới sáng tạo
                  không ngừng.
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-sm font-light">
                  <FaCheck className="text-blue-400 text-xs" /> Lấy khách hàng
                  làm trọng tâm.
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-sm font-light">
                  <FaCheck className="text-blue-400 text-xs" /> Minh bạch và
                  hiệu quả.
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
