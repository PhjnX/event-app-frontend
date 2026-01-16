import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaEnvelope,
  FaLock,
  FaUser,
  FaKey,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../../../../store";
import {
  registerUser,
  verifyUser,
  clearError,
} from "../../../../../store/slices/auth";
import { modalVariants } from "@/constants/motions";

import LogoApp from "@/assets/images/Logo_EMS.png";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [verificationCode, setVerificationCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setVerificationCode("");
      setLocalError(null);
      // Reset hiển thị mật khẩu
      setShowPassword(false);
      setShowConfirmPassword(false);
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (localError) setLocalError(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setLocalError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Mật khẩu xác nhận không khớp!");
      return;
    }

    const resultAction = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(resultAction)) {
      toast.success("Đăng ký thành công! Mã xác thực đã được gửi về email.");
      setStep(2);
      dispatch(clearError());
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setLocalError("Vui lòng nhập mã xác thực.");
      return;
    }

    const verifyData = {
      email: formData.email,
      verificationCode: verificationCode,
    };

    const resultAction = await dispatch(verifyUser(verifyData));
    if (verifyUser.fulfilled.match(resultAction)) {
      toast.success("Xác thực thành công! Bạn có thể đăng nhập ngay.");
      onSwitchToLogin();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-sans selection:bg-[rgba(216,201,123,0.3)]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-[#1a1a1a] border border-[rgba(216,201,123,0.3)] rounded-2xl shadow-[0_0_50px_-12px_rgba(181,166,95,0.25)] overflow-hidden z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 z-10 transition-colors"
            >
              <FaTimes size={20} />
            </button>

            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[rgba(216,201,123,0)] via-[#D8C97B] to-[rgba(216,201,123,0)]"></div>

            <div className="p-8 pt-10">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <img
                    src={LogoApp}
                    alt="Webie Logo"
                    className="w-10 h-10 object-contain filter drop-shadow-[0_0_8px_rgba(216,201,123,0.4)]"
                  />
                  <h2 className="text-3xl font-bold text-white uppercase tracking-tight">
                    {step === 1 ? "Đăng Ký" : "Xác Thực Email"}
                  </h2>
                </div>
                <p className="text-gray-400 text-sm font-light">
                  {step === 1
                    ? "Tham gia cùng Webie EMS ngay hôm nay"
                    : `Vui lòng nhập mã OTP đã gửi tới ${formData.email}`}
                </p>
              </div>

              {(error || localError) && (
                <div className="mb-4 p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.5)] rounded-lg text-red-400 text-sm text-center font-medium">
                  {localError || error}
                </div>
              )}

              {step === 1 && (
                <form className="space-y-4" onSubmit={handleRegister}>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1 tracking-wider">
                      Họ và Tên
                    </label>
                    <div className="relative group">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none transition-all focus:ring-1 focus:ring-[#D8C97B]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1 tracking-wider">
                      Email
                    </label>
                    <div className="relative group">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none transition-all focus:ring-1 focus:ring-[#D8C97B]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1 tracking-wider">
                      Mật khẩu
                    </label>
                    <div className="relative group">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-12 pr-12 text-white focus:border-[#D8C97B] focus:outline-none transition-all focus:ring-1 focus:ring-[#D8C97B]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D8C97B] cursor-pointer transition-colors p-1"
                      >
                        {showPassword ? (
                          <FaEyeSlash size={16} />
                        ) : (
                          <FaEye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1 tracking-wider">
                      Nhập lại mật khẩu
                    </label>
                    <div className="relative group">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-12 pr-12 text-white focus:border-[#D8C97B] focus:outline-none transition-all focus:ring-1 focus:ring-[#D8C97B]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D8C97B] cursor-pointer transition-colors p-1"
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash size={16} />
                        ) : (
                          <FaEye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#D8C97B] hover:bg-[#c4b56f] text-black font-bold py-3.5 rounded-xl transition-all hover:-translate-y-1 shadow-lg cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center uppercase text-sm tracking-widest"
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-black border-t-[rgba(0,0,0,0)] rounded-full animate-spin mr-2"></span>
                        Đang đăng ký...
                      </>
                    ) : (
                      "Tiếp tục"
                    )}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form className="space-y-6" onSubmit={handleVerify}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1 tracking-wider">
                      Mã xác thực (OTP)
                    </label>
                    <div className="relative group">
                      <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Nhập mã OTP..."
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-12 pr-4 text-white text-lg tracking-[0.5em] focus:border-[#D8C97B] focus:outline-none transition-all text-center font-bold"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#D8C97B] hover:bg-[#c4b56f] text-black font-bold py-3.5 rounded-xl transition-all hover:-translate-y-1 shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center uppercase text-sm tracking-widest"
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-black border-t-[rgba(0,0,0,0)] rounded-full animate-spin mr-2"></span>
                        Đang xác thực...
                      </>
                    ) : (
                      "Hoàn tất đăng ký"
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-gray-500 hover:text-white text-sm underline cursor-pointer transition-colors font-medium"
                    >
                      Quay lại bước trước
                    </button>
                  </div>
                </form>
              )}

              {step === 1 && (
                <p className="text-center text-gray-500 text-sm mt-6 font-light">
                  Đã có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-[#D8C97B] font-bold hover:underline cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
