import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import { modalVariants } from "@/constants/motions"; 
import LogoApp from "@/assets/images/Logo_EMS.png";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.warning("Vui lòng nhập email đăng ký!");
      return;
    }

    setIsLoading(true);
    try {

      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Đã gửi OTP qua email! Hãy kiểm tra hộp thư.");
      onClose();
    } catch (error: any) {
      toast.error("Gửi OTP thất bại, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-[#1a1a1a] border border-[#D8C97B]/30 rounded-2xl shadow-[0_0_50px_-12px_rgba(181,166,95,0.25)] overflow-hidden z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 z-10 cursor-pointer"
            >
              <FaTimes size={20} />
            </button>
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#D8C97B] to-transparent"></div>

            <div className="p-8 pt-10 text-center">
              <div className="flex flex-col items-center mb-6">
                <img
                  src={LogoApp}
                  alt="Webie Logo"
                  className="w-12 h-12 object-contain mb-4"
                />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Quên Mật Khẩu?
                </h2>
                <p className="text-gray-400 text-sm px-4">
                  Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn
                  khôi phục mật khẩu.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSendOTP}>
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1">
                    Email đăng ký
                  </label>
                  <div className="relative group">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  className="w-full bg-[#D8C97B] hover:bg-[#c4b56f] text-black font-bold py-3.5 rounded-xl transition-all hover:-translate-y-1 shadow-lg cursor-pointer flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : null}
                  {isLoading ? "Đang gửi..." : "Gửi Hướng Dẫn"}
                </button>
              </form>

              <button
                onClick={onSwitchToLogin}
                className="mt-8 flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm transition-colors cursor-pointer mx-auto hover:underline"
              >
                <FaArrowLeft /> Quay lại đăng nhập
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
