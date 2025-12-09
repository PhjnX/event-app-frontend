import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaHandshake, FaUser } from "react-icons/fa";
import { CONTACT_INFO } from "./form-contact-data"; // Import Data
import type {
  RegistrationType,
  RegistrationFormData,
} from "@/pages/HomeTemplate/_components/home/models/form"; // Import Model
// Import Model

// --- COMPONENT CON 1: HÌNH NỀN & MẠCH ĐIỆN ---
const BackgroundDecoration = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[#0a0a0a]"></div>
    {/* SVG Circuit Pattern */}
    <div className="absolute inset-0 opacity-10">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <pattern
          id="circuit"
          x="0"
          y="0"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M10,10 L90,10 M10,10 L10,90"
            stroke="white"
            strokeWidth="1"
            fill="none"
          />
          <circle cx="10" cy="10" r="2" fill="white" />
          <circle cx="90" cy="90" r="2" fill="white" />
          <path
            d="M50,50 L90,50 M50,50 L50,90"
            stroke="white"
            strokeWidth="1"
            fill="none"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#circuit)" />
      </svg>
    </div>
    {/* Blurs */}
    <motion.div
      animate={{ x: [0, 50, 0], y: [0, -50, 0], opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#B5A65F] rounded-full blur-[150px] opacity-10"
    />
    <motion.div
      animate={{ x: [0, -30, 0], y: [0, 30, 0], opacity: [0.05, 0.15, 0.05] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[150px] opacity-10"
    />
  </div>
);

// --- COMPONENT CON 2: CỘT THÔNG TIN LIÊN HỆ ---
const ContactColumn = () => (
  <motion.div
    className="lg:col-span-5 flex flex-col justify-between h-full"
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: false }}
    transition={{ duration: 0.8 }}
  >
    <div>
      <h3 className="text-3xl font-bold mb-6 text-white font-noto">
        Kết Nối Cùng <br />
        <span className="text-[#B5A65F]">Kiến Tạo Tương Lai</span>
      </h3>
      <p className="text-gray-400 mb-10 leading-relaxed text-justify">
        Chúng tôi luôn tìm kiếm những cơ hội hợp tác mới để mang lại giá trị tốt
        nhất cho cộng đồng sinh viên và doanh nghiệp. Đừng ngần ngại liên hệ với
        chúng tôi qua các kênh dưới đây.
      </p>

      {/* List Contact từ Data */}
      <div className="space-y-6">
        {CONTACT_INFO.map((item) => (
          <div key={item.id} className="flex items-start gap-4 group">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#B5A65F] group-hover:bg-[#B5A65F] group-hover:text-black transition-all duration-300">
              {item.icon}
            </div>
            <div>
              <h4 className="text-white font-bold uppercase text-sm mb-1">
                {item.title}
              </h4>
              <p className="text-gray-400 text-sm">{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Decor Image */}
    <div className="mt-12 relative rounded-xl overflow-hidden h-40 border border-white/10 hidden lg:block group">
      <img
        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80"
        alt="Teamwork"
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-[#B5A65F]/20 mix-blend-overlay"></div>
    </div>
  </motion.div>
);

// --- COMPONENT CON 3: INPUT HELPER (Để đỡ lặp code input) ---
const FormInput = ({
  label,
  placeholder,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div className="space-y-2">
    <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
      {label}
    </label>
    <input
      {...props}
      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#B5A65F] focus:outline-none focus:ring-1 focus:ring-[#B5A65F] transition-all"
      placeholder={placeholder}
    />
  </div>
);

// --- COMPONENT CON 4: CỘT FORM ĐĂNG KÝ ---
const RegistrationForm = () => {
  const [activeTab, setActiveTab] = useState<RegistrationType>("user");
  // Demo state handling (có thể mở rộng sau)
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    email: "",
    message: "",
    company: "",
    position: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <motion.div
      className="lg:col-span-7"
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow trong form */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B5A65F]/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Tabs */}
        <div className="flex p-1 bg-black/40 rounded-full mb-8 relative z-10 w-fit mx-auto lg:mx-0 border border-white/10">
          <button
            onClick={() => setActiveTab("user")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase transition-all duration-300 ${
              activeTab === "user"
                ? "bg-[#B5A65F] text-black shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaUser /> Cá Nhân
          </button>
          <button
            onClick={() => setActiveTab("partner")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase transition-all duration-300 ${
              activeTab === "partner"
                ? "bg-[#B5A65F] text-black shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaHandshake /> Doanh Nghiệp
          </button>
        </div>

        {/* Form Inputs */}
        <form
          className="space-y-6 relative z-10"
          onSubmit={(e) => e.preventDefault()}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Họ và Tên"
                  name="name"
                  placeholder="Nhập họ tên của bạn"
                  value={formData.name}
                  onChange={handleChange}
                />
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {activeTab === "partner" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput
                    label="Tên Doanh Nghiệp"
                    name="company"
                    placeholder="Công ty TNHH ABC..."
                    value={formData.company}
                    onChange={handleChange}
                  />
                  <FormInput
                    label="Chức vụ"
                    name="position"
                    placeholder="CEO, HR Manager..."
                    value={formData.position}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                  {activeTab === "user"
                    ? "Bạn quan tâm sự kiện nào?"
                    : "Nội dung hợp tác"}
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={
                    activeTab === "user"
                      ? "Ví dụ: Sự kiện âm nhạc, hội thảo AI..."
                      : "Mô tả ngắn gọn về nhu cầu hợp tác..."
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#B5A65F] focus:outline-none focus:ring-1 focus:ring-[#B5A65F] transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="policy"
                  className=" cursor-pointer w-4 h-4 rounded border-gray-600 text-[#B5A65F] focus:ring-[#B5A65F] bg-transparent"
                />
                <label
                  htmlFor="policy"
                  className="cursor-pointertext-sm text-gray-400"
                >
                  Tôi đồng ý với{" "}
                  <a
                    href="#"
                    className="text-[#B5A65F] underline hover:text-white"
                  >
                    chính sách bảo mật
                  </a>{" "}
                  của Webie.
                </label>
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full group relative overflow-hidden rounded-xl bg-linear-to-r from-[#B5A65F] to-[#D8C97B] py-4 font-bold text-black uppercase tracking-widest shadow-lg mt-4"
          >
            {/* Sử dụng class animate-shine đã config trong index.css */}
            <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shine-infinite group-hover:animate-shine-fast"></div>
            <span className="relative z-10 flex items-center justify-center gap-2 cursor-pointer">
              {activeTab === "user" ? "Đăng Ký Ngay" : "Gửi Yêu Cầu"}{" "}
              <FaPaperPlane />
            </span>
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
export default function RegistrationSection() {
  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden text-white font-noto">
      <BackgroundDecoration />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-wide mb-6 font-noto drop-shadow-xl">
            LIÊN HỆ & <span className="text-[#B5A65F]">HỢP TÁC</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl font-noto italic max-w-3xl mx-auto leading-relaxed">
            "Bạn muốn tham gia sự kiện hay trở thành đối tác chiến lược? Hãy để
            lại thông tin, Webie Vietnam sẽ kết nối ngay."
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <ContactColumn />
          <RegistrationForm />
        </div>
      </div>
    </section>
  );
}
