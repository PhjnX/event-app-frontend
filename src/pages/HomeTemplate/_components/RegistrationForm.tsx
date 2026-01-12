import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaHandshake, FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "@/store"; // Điều chỉnh đường dẫn import nếu cần
import { registerOrganizer } from "@/store/slices/organizerSlice";
import LoginModal from "../_components/modals/LoginModal";
import RegisterModal from "../_components/modals/RegisterModal";
import ForgotPasswordModal from "../_components/modals/ForgotPasswordModal";

type RegistrationType = "PERSONAL" | "BUSINESS";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  company: string;
  position: string;
}

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
      className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#D8C97B] focus:outline-none focus:ring-1 focus:ring-[#D8C97B] transition-all"
      placeholder={placeholder}
    />
  </div>
);

export default function RegistrationForm({
  className = "",
  onSuccess,
}: {
  className?: string;
  onSuccess?: () => void;
}) {
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
      onSuccess?.();
    }
  };

  return (
    <>
      <motion.div
        className={className}
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-[rgba(26,26,26,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden h-full">
          {/* Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[rgba(216,201,123,0.1)] rounded-full blur-[80px] pointer-events-none"></div>

          {/* Tabs */}
          <div className="flex p-1 bg-[rgba(0,0,0,0.4)] rounded-full mb-8 relative z-10 w-fit mx-auto lg:mx-0 border border-[rgba(255,255,255,0.1)]">
            <button
              type="button"
              onClick={() => setActiveTab("PERSONAL")}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-full text-xs md:text-sm font-bold uppercase transition-all duration-300 ${
                activeTab === "PERSONAL"
                  ? "bg-[#D8C97B] text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FaUser /> Cá Nhân
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("BUSINESS")}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-full text-xs md:text-sm font-bold uppercase transition-all duration-300 ${
                activeTab === "BUSINESS"
                  ? "bg-[#D8C97B] text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FaHandshake /> Doanh Nghiệp
            </button>
          </div>

          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Họ và Tên"
                    name="name"
                    placeholder="Nhập họ tên..."
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <FormInput
                    label="Email Liên Hệ"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="Công ty ABC..."
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
                      ? "Kinh nghiệm / Giới thiệu"
                      : "Nhu cầu hợp tác"}
                  </label>
                  <textarea
                    required
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={
                      activeTab === "PERSONAL"
                        ? "Kinh nghiệm tổ chức..."
                        : "Lĩnh vực hoạt động..."
                    }
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#D8C97B] focus:outline-none focus:ring-1 focus:ring-[#D8C97B] transition-all resize-none"
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
                    className="cursor-pointer text-xs md:text-sm text-gray-400"
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
              className="w-full group relative overflow-hidden rounded-xl bg-[#D8C97B] py-4 font-bold text-black uppercase tracking-widest shadow-lg mt-4 disabled:opacity-50"
            >
              <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-[rgba(255,255,255,0)] via-[rgba(255,255,255,0.4)] to-[rgba(255,255,255,0)] -skew-x-12 animate-shine-infinite group-hover:animate-shine-fast"></div>
              <span className="relative z-10 flex items-center justify-center gap-2 cursor-pointer">
                {isLoading
                  ? "Đang xử lý..."
                  : activeTab === "PERSONAL"
                  ? "Đăng Ký Organizer"
                  : "Gửi Hồ Sơ"}{" "}
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
}
