import { motion } from "framer-motion";
import { FaEye, FaBullseye, FaCheck } from "react-icons/fa";

const VisionSection = () => {
  return (
    <section className="relative py-32 bg-[#0a0a0a] overflow-hidden font-noto text-white">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#D8C97B]/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[150px]"></div>

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#fff 1.5px, transparent 1.5px)",
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
            Định Hướng Chiến Lược
          </span>

          <h2 className="text-4xl md:text-5xl font-black uppercase text-[#D8C97B] mt-6 mb-4 tracking-wide drop-shadow-lg">
            TẦM NHÌN <span className="text-[#D8C97B]">&</span>{" "}
            <span className="text-white">SỨ MỆNH</span>
          </h2>

          <p className="text-gray-400 italic text-lg font-light max-w-3xl mx-auto">
            "Chúng tôi không chỉ tổ chức sự kiện, chúng tôi kiến tạo di sản số
            cho tương lai."
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -10 }}
            className="group relative bg-[#1a1a1a] rounded-3xl p-8 md:p-12 border border-white/10 overflow-hidden shadow-2xl"
          >
            <span className="absolute -bottom-10 -right-5 text-[12rem] font-black text-white/5 select-none transition-all group-hover:text-white/10 group-hover:scale-110 duration-700">
              01
            </span>

            <div className="absolute inset-0 bg-linear-to-br from-[#D8C97B]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-[#D8C97B]/10 flex items-center justify-center mb-6 border border-[#D8C97B]/30 group-hover:bg-[#D8C97B] transition-all duration-300">
                <FaEye className="text-2xl text-[#D8C97B] group-hover:text-black" />
              </div>

              <h4 className="text-3xl font-black text-white uppercase mb-4 tracking-wide group-hover:text-[#D8C97B] transition-colors">
                Tầm Nhìn
              </h4>

              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Trở thành biểu tượng tiên phong trong lĩnh vực{" "}
                <strong>EdTech Event</strong> tại Đông Nam Á. Chúng tôi định
                hình lại cách con người kết nối và học tập thông qua công nghệ.
              </p>

              <div className="w-12 h-1 bg-[#D8C97B] group-hover:w-full transition-all duration-700"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -10 }}
            className="group relative bg-[#1a1a1a] rounded-3xl p-8 md:p-12 border border-white/10 overflow-hidden shadow-2xl"
          >
            <span className="absolute -bottom-10 -right-5 text-[12rem] font-black text-white/5 select-none transition-all group-hover:text-white/10 group-hover:scale-110 duration-700">
              02
            </span>

            <div className="absolute inset-0 bg-linear-to-bl from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

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
