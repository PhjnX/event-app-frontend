import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaEnvelope,
  FaArrowLeft,
  FaKey,
  FaLock,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { modalVariants } from "@/constants/motions";
import LogoApp from "@/assets/images/Logo_EMS.png";
import apiService from "../../../../../services/apiService";

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
  const [step, setStep] = useState<1 | 2>(1); 
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setIsLoading(false);
    }
  }, [isOpen]);

  // BƯỚC 1: Gửi OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim(); 

    if (!cleanEmail) {
      toast.warning("Vui lòng nhập email!");
      return;
    }

    setIsLoading(true);
    try {
      await apiService.post("/users/forgot-password", { email: cleanEmail });
      toast.success("Đã gửi OTP về email của bạn!");
      setStep(2);
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Email không tồn tại trong hệ thống.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean data trước khi gửi
    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();

    if (!cleanOtp || !newPassword || !confirmPassword) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp (Frontend check)!");
      return;
    }

    setIsLoading(true);
    try {
      await apiService.post("/users/reset-password", {
        email: cleanEmail,
        otp: cleanOtp,
        newPassword: newPassword,
        confirmPassword: confirmPassword, 
      });

      toast.success("Đổi mật khẩu thành công! Hãy đăng nhập lại.");
      onClose();
      onSwitchToLogin();
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Quá trình đổi mật khẩu thất bại. Vui lòng thử lại.";

      toast.error(msg);
      console.error("Reset Password Error:", error);
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
            className="relative w-full max-w-md bg-[#1a1a1a] border border-[#D8C97B]/30 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 z-10"
            >
              <FaTimes size={20} />
            </button>
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#D8C97B] to-transparent"></div>

            <div className="p-8 pt-10 text-center">
              <div className="flex flex-col items-center mb-6">
                <img
                  src={LogoApp}
                  alt="Logo"
                  className="w-12 h-12 object-contain mb-4"
                />
                <h2 className="text-2xl font-bold text-white mb-2">
                  {step === 1 ? "Quên Mật Khẩu?" : "Đặt Lại Mật Khẩu"}
                </h2>
                <p className="text-gray-400 text-sm px-4">
                  {step === 1
                    ? "Nhập email đã đăng ký để nhận mã OTP."
                    : "Nhập mã OTP từ email và thiết lập mật khẩu mới."}
                </p>
              </div>

              {step === 1 ? (
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
                    className="w-full bg-[#D8C97B] hover:bg-[#c4b56f] text-black font-bold py-3.5 rounded-xl transition-all hover:-translate-y-1 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Đang gửi..." : "Gửi OTP"}
                  </button>
                </form>
              ) : (
                <form className="space-y-5" onSubmit={handleResetPassword}>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1">
                      Mã OTP
                    </label>
                    <div className="relative group">
                      <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B]" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Nhập mã 6 số..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1">
                      Mật khẩu mới
                    </label>
                    <div className="relative group">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B]" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1">
                      Nhập lại mật khẩu
                    </label>
                    <div className="relative group">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B]" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <button
                    disabled={isLoading}
                    className="w-full bg-[#D8C97B] hover:bg-[#c4b56f] text-black font-bold py-3.5 rounded-xl transition-all hover:-translate-y-1 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Đang xử lý..." : "Xác Nhận Đổi Mật Khẩu"}
                  </button>
                </form>
              )}

              <button
                onClick={step === 1 ? onSwitchToLogin : () => setStep(1)}
                className="mt-8 flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm transition-colors cursor-pointer mx-auto hover:underline"
              >
                <FaArrowLeft />{" "}
                {step === 1 ? "Quay lại đăng nhập" : "Quay lại bước 1"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
