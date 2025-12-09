import React from "react";
import { motion, type Variants } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: "easeOut" },
  },
};

const FoundersPledge: React.FC = () => {
  return (
    <section className="py-32 bg-[#0a0a0a] font-noto text-white relative overflow-hidden">
      {/* 
        Thêm Font chữ ký vào đây 
        (Bạn có thể chuyển dòng này vào file index.css hoặc global css nếu muốn sạch code hơn)
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        .font-signature {
          font-family: 'Great Vibes', cursive;
        }
      `}</style>

      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#B5A65F]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.4 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 p-10 md:p-16 rounded-3xl relative text-center"
        >
          <FaQuoteLeft className="text-4xl text-[#B5A65F] mx-auto mb-8 opacity-80" />

          <h3 className="text-2xl md:text-3xl font-light italic leading-relaxed text-gray-200 mb-10">
            "Tại Webie, chúng tôi không bán phần mềm. Chúng tôi bán{" "}
            <strong className="text-white font-bold">sự an tâm</strong> và{" "}
            <strong className="text-white font-bold">
              trải nghiệm hoàn hảo
            </strong>
            . Nếu sản phẩm không mang lại giá trị thực cho khách hàng, đó là sự
            thất bại của chính tôi."
          </h3>

          <div className="flex flex-col items-center gap-2">
            {/* --- CHỮ KÝ MỚI TÊN HUYỀN --- */}
            <div className="relative">
              <span className="font-signature text-6xl md:text-7xl text-[#B5A65F] opacity-90 rotate-[-5deg] block pr-4">
                Huyền Đặng
              </span>
              {/* Nét gạch chân giả lập chữ ký */}
              <svg
                className="absolute -bottom-2 left-0 w-full h-8 text-[#B5A65F] opacity-70 -rotate-2"
                viewBox="0 0 200 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 10 C 50 20, 150 20, 190 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="text-center mt-6">
              <h4 className="text-xl font-bold uppercase tracking-wide">
                Đặng Vũ Thị Mỹ Huyền
              </h4>
              <p className="text-[#B5A65F] text-xs font-bold tracking-[0.2em] uppercase mt-1">
                Founder & CEO
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FoundersPledge;
