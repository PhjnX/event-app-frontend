import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaEnvelope, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../../../../store";
import { loginUser, clearError } from "../../../../../store/slices/auth";
import { modalVariants } from "@/constants/motions";

import GoogleLogo from "@/assets/images/google-color.svg";
import LogoApp from "@/assets/images/Logo_EMS.png";

const GOOGLE_LOGIN_URL =
  "https://ems-backend-jkjx.onrender.com/oauth2/authorization/google";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToForgot,
}: LoginModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated && isOpen) onClose();
  }, [isAuthenticated, isOpen, onClose]);

  useEffect(() => {
    if (isOpen) dispatch(clearError());
  }, [isOpen, dispatch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.warning("Vui lòng nhập Email và Mật khẩu.");
      return;
    }

    const resultAction = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(resultAction)) {
      toast.success("Đăng nhập thành công! 🎉");
    } else {
      const rawMsg = (resultAction.payload as string) || "";

      if (
        rawMsg.includes("Bad credentials") ||
        rawMsg.includes("Lỗi hệ thống") ||
        rawMsg.includes("User not found")
      ) {
        toast.error("Email hoặc mật khẩu không chính xác!");
      } else {
        toast.error(rawMsg || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
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
                    alt="Logo"
                    className="w-10 h-10 object-contain"
                  />
                  <h2 className="text-3xl font-bold text-white">Đăng Nhập</h2>
                </div>
                <p className="text-gray-400 text-sm">
                  Chào mừng bạn quay trở lại!
                </p>
              </div>

              {error && !error.includes("Bad credentials") && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#D8C97B] uppercase tracking-wider ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-[#D8C97B] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase tracking-wider">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={onSwitchToForgot}
                      className="text-xs text-gray-500 hover:text-white transition-colors hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-[#D8C97B] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  className="w-full bg-[#D8C97B] hover:bg-[#c4b56f] text-black font-bold py-3.5 rounded-xl transition-all hover:-translate-y-1 shadow-lg cursor-pointer flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : null}
                  {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
                </button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-gray-500 text-xs uppercase">Hoặc</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              <a
                href={GOOGLE_LOGIN_URL}
                className="w-full bg-white text-black font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all hover:-translate-y-1 cursor-pointer no-underline"
              >
                <img
                  src={GoogleLogo}
                  alt="Google"
                  className="w-5 h-5 object-contain"
                />
                <span>Đăng nhập với Google</span>
              </a>

              <p className="text-center text-gray-500 text-sm mt-8">
                Chưa có tài khoản?{" "}
                <button
                  onClick={onSwitchToRegister}
                  className="text-[#D8C97B] font-bold hover:underline cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
