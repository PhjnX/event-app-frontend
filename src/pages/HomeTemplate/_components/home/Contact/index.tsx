import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaHandshake, FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import type { AppDispatch, RootState } from "../../../../../store";
import { registerOrganizer } from "../../../../../store/slices/organizerSlice";

import { CONTACT_INFO } from "./form-contact-data";

import LoginModal from "../../modals/LoginModal";
import RegisterModal from "../../modals/RegisterModal";
import ForgotPasswordModal from "../../modals/ForgotPasswordModal";

type RegistrationType = "PERSONAL" | "BUSINESS";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  company: string;
  position: string;
}

const BackgroundDecoration = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[#0a0a0a]"></div>
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
    <motion.div
      animate={{ x: [0, 50, 0], y: [0, -50, 0], opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D8C97B] rounded-full blur-[150px] opacity-10"
    />
    <motion.div
      animate={{ x: [0, -30, 0], y: [0, 30, 0], opacity: [0.05, 0.15, 0.05] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[150px] opacity-10"
    />
  </div>
);

const ContactColumn = () => (
  <motion.div
    className="lg:col-span-5 flex flex-col gap-10"
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: false }}
    transition={{ duration: 0.8 }}
  >
    <div>
      <h3 className="text-3xl font-bold mb-6 text-white font-noto">
        Kết Nối Cùng <br />
        <span className="text-[#D8C97B]">Kiến Tạo Tương Lai</span>
      </h3>
      <p className="text-gray-400 mb-10 leading-relaxed text-justify">
        Chúng tôi luôn tìm kiếm những cơ hội hợp tác mới để mang lại giá trị tốt
        nhất cho cộng đồng sinh viên và doanh nghiệp. Đừng ngần ngại liên hệ với
        chúng tôi qua các kênh dưới đây.
      </p>

      <div className="space-y-6">
        {CONTACT_INFO.map((item) => (
          <div key={item.id} className="flex items-start gap-4 group">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D8C97B] group-hover:bg-[#D8C97B] group-hover:text-black transition-all duration-300 flex-shrink-0">
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

    <div className="relative rounded-xl overflow-hidden h-48 border border-white/10 hidden lg:block group w-full">
      <img
        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80"
        alt="Teamwork"
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-[#D8C97B]/20 mix-blend-overlay"></div>
    </div>
  </motion.div>
);

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
      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#D8C97B] focus:outline-none focus:ring-1 focus:ring-[#D8C97B] transition-all"
      placeholder={placeholder}
    />
  </div>
);

const RegistrationForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isLoading } = useSelector((state: RootState) => state.organizers);

  const [activeTab, setActiveTab] = useState<RegistrationType>("PERSONAL");
  const [modalType, setModalType] = useState<
    "LOGIN" | "REGISTER" | "FORGOT" | null
  >(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
    company: "",
    position: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info("Bạn cần đăng nhập để gửi hồ sơ đăng ký!");
      setModalType("LOGIN");
      return;
    }

    const apiData = {
      name: activeTab === "BUSINESS" ? formData.company : formData.name,
      contactEmail: formData.email,
      contactPhoneNumber: formData.phone,
      description: `[${activeTab}] ${
        activeTab === "BUSINESS"
          ? `Đại diện: ${formData.name} - ${formData.position}. `
          : ""
      } ${formData.message}`,
    };

    const resultAction = await dispatch(registerOrganizer(apiData));

    if (registerOrganizer.fulfilled.match(resultAction)) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        company: "",
        position: "",
      });
    }
  };

  return (
    <>
      <motion.div
        className="lg:col-span-7"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D8C97B]/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="flex p-1 bg-black/40 rounded-full mb-8 relative z-10 w-fit mx-auto lg:mx-0 border border-white/10">
            <button
              onClick={() => setActiveTab("PERSONAL")} 
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase transition-all duration-300 ${
                activeTab === "PERSONAL"
                  ? "bg-[#D8C97B] text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FaUser /> Cá Nhân
            </button>
            <button
              onClick={() => setActiveTab("BUSINESS")} 
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase transition-all duration-300 ${
                activeTab === "BUSINESS"
                  ? "bg-[#D8C97B] text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FaHandshake /> Doanh Nghiệp
            </button>
          </div>

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
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
                    required
                  />
                  <FormInput
                    label="Email Liên Hệ"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput
                    label="Số Điện Thoại"
                    name="phone"
                    placeholder="09xxxxxxx"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />

                  {activeTab === "BUSINESS" && (
                    <FormInput
                      label="Tên Doanh Nghiệp"
                      name="company"
                      placeholder="Công ty TNHH ABC..."
                      value={formData.company}
                      onChange={handleChange}
                      required
                    />
                  )}
                </div>

                {activeTab === "BUSINESS" && (
                  <FormInput
                    label="Chức vụ"
                    name="position"
                    placeholder="CEO, HR Manager..."
                    value={formData.position}
                    onChange={handleChange}
                    required
                  />
                )}

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                    {activeTab === "PERSONAL"
                      ? "Kinh nghiệm / Giới thiệu bản thân"
                      : "Giới thiệu doanh nghiệp / Nhu cầu hợp tác"}
                  </label>
                  <textarea
                    required
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={
                      activeTab === "PERSONAL"
                        ? "Kinh nghiệm tổ chức sự kiện..."
                        : "Quy mô, lĩnh vực hoạt động..."
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#D8C97B] focus:outline-none focus:ring-1 focus:ring-[#D8C97B] transition-all resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="policy"
                    required
                    className="cursor-pointer w-4 h-4 rounded border-gray-600 text-[#D8C97B] focus:ring-[#D8C97B] bg-transparent"
                  />
                  <label
                    htmlFor="policy"
                    className="cursor-pointer text-sm text-gray-400"
                  >
                    Tôi cam kết thông tin trên là chính xác.
                  </label>
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.button
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full group relative overflow-hidden rounded-xl bg-linear-to-r from-[#D8C97B] to-[#D8C97B] py-4 font-bold text-black uppercase tracking-widest shadow-lg mt-4 disabled:opacity-50"
            >
              <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shine-infinite group-hover:animate-shine-fast"></div>
              <span className="relative z-10 flex items-center justify-center gap-2 cursor-pointer">
                {isLoading
                  ? "Đang xử lý..."
                  : activeTab === "PERSONAL"
                  ? "Đăng Ký Organizer"
                  : "Gửi Hồ Sơ"}
                {!isLoading && <FaPaperPlane />}
              </span>
            </motion.button>
          </form>
        </div>
      </motion.div>

      <LoginModal
        isOpen={modalType === "LOGIN"}
        onClose={() => setModalType(null)}
        onSwitchToRegister={() => setModalType("REGISTER")}
        onSwitchToForgot={() => setModalType("FORGOT")}
      />
      <RegisterModal
        isOpen={modalType === "REGISTER"}
        onClose={() => setModalType(null)}
        onSwitchToLogin={() => setModalType("LOGIN")}
      />
      <ForgotPasswordModal
        isOpen={modalType === "FORGOT"}
        onClose={() => setModalType(null)}
        onSwitchToLogin={() => setModalType("LOGIN")}
      />
    </>
  );
};

export default function RegistrationSection() {
  return (
    <section id="contact" className="relative py-24 bg-[#0a0a0a] overflow-hidden text-white font-noto">
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
            LIÊN HỆ & <span className="text-[#D8C97B]">HỢP TÁC</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl font-noto italic max-w-3xl mx-auto leading-relaxed">
            "Trở thành đối tác chiến lược cùng Webie Vietnam."
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
