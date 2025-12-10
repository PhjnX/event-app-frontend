import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../../../../store";
import { registerUser, clearError } from "../../../../../store/slices/auth";
import { modalVariants } from "@/constants/motions"; 

import GoogleLogo from "@/assets/images/google-color.svg";
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

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setLocalError(null);
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
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      onSwitchToLogin();
    } else {
      const errMsg = resultAction.payload as string;
      toast.error(errMsg || "Đăng ký thất bại");
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

            <div className="p-8 pt-10">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <img
                    src={LogoApp}
                    alt="Webie Logo"
                    className="w-10 h-10 object-contain"
                  />
                  <h2 className="text-3xl font-bold text-white">Đăng Ký</h2>
                </div>
                <p className="text-gray-400 text-sm">
                  Tham gia cùng chúng tôi ngay hôm nay
                </p>
              </div>

              {(error || localError) && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                  {localError || error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1">
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
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1">
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
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1">
                    Mật khẩu
                  </label>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1">
                    Nhập lại mật khẩu
                  </label>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  className="w-full bg-[#D8C97B] hover:bg-[#c4b56f] text-black font-bold py-3.5 rounded-xl transition-all hover:-translate-y-1 shadow-lg cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isLoading ? (
                    <>
                      {" "}
                      <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></span>{" "}
                      Đang xử lý...{" "}
                    </>
                  ) : (
                    "Đăng Ký Ngay"
                  )}
                </button>
              </form>

              <div className="flex items-center gap-4 my-4">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-gray-500 text-xs uppercase">Hoặc</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              <button className="w-full bg-white text-black font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all hover:-translate-y-1 cursor-pointer">
                <img
                  src={GoogleLogo}
                  alt="Google"
                  className="w-5 h-5 object-contain"
                />
                <span>Đăng ký với Google</span>
              </button>

              <p className="text-center text-gray-500 text-sm mt-6">
                Đã có tài khoản?{" "}
                <button
                  onClick={onSwitchToLogin}
                  className="text-[#D8C97B] font-bold hover:underline cursor-pointer"
                >
                  Đăng nhập
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
