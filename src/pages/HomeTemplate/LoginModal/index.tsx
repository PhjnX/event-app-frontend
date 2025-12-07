import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaGoogle, FaEnvelope, FaLock } from "react-icons/fa";
import { toast } from "react-toastify"; // Import Toast

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { loginUser, clearError } from "../../../store/slices/auth";

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

  // Effect: Nếu đăng nhập thành công -> Đóng Modal
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  // Effect: Clear lỗi cũ khi mở modal
  useEffect(() => {
    if (isOpen) dispatch(clearError());
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  // Xử lý Submit Form
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning("Vui lòng nhập Email và Mật khẩu.");
      return;
    }

    // Gọi API Login thông qua Redux Thunk
    const resultAction = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(resultAction)) {
      toast.success("Đăng nhập thành công! 🎉");
    } else {
      const errMsg = resultAction.payload as string;
      toast.error(errMsg || "Email hoặc mật khẩu không đúng.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          ></motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#1a1a1a] border border-[#B5A65F]/30 rounded-2xl shadow-[0_0_50px_-12px_rgba(181,166,95,0.25)] overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 z-10 cursor-pointer"
            >
              <FaTimes size={20} />
            </button>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B5A65F] to-transparent"></div>

            <div className="p-8 pt-10">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Đăng Nhập
                </h2>
                <p className="text-gray-400 text-sm">
                  Chào mừng bạn quay trở lại!
                </p>
              </div>

              {/* HIỂN THỊ LỖI NẾU CÓ */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#B5A65F] uppercase tracking-wider ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F] transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-[#B5A65F] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-[#B5A65F] uppercase tracking-wider">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={onSwitchToForgot}
                      className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F] transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-[#B5A65F] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  className="w-full bg-[#B5A65F] hover:bg-[#c4b56f] text-black font-bold py-3.5 rounded-xl transition-all hover:-translate-y-1 shadow-lg cursor-pointer flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
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

              <button className="w-full bg-white text-black font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all hover:-translate-y-1 cursor-pointer">
                <FaGoogle className="text-red-500 text-lg" />
                <span>Google</span>
              </button>

              <p className="text-center text-gray-500 text-sm mt-8">
                Chưa có tài khoản?{" "}
                <button
                  onClick={onSwitchToRegister}
                  className="text-[#B5A65F] font-bold hover:underline cursor-pointer"
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
