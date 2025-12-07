import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaEnvelope, FaArrowLeft } from "react-icons/fa";

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
  if (!isOpen) return null;

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

            <div className="p-8 pt-10 text-center">
              <div className="w-16 h-16 bg-[#B5A65F]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#B5A65F]">
                <FaEnvelope size={28} />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Quên Mật Khẩu?
              </h2>
              <p className="text-gray-400 text-sm mb-8 px-4">
                Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn
                khôi phục mật khẩu.
              </p>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-[#B5A65F] uppercase ml-1">
                    Email đăng ký
                  </label>
                  <div className="relative group">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F] transition-colors" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button className="w-full bg-[#B5A65F] hover:bg-[#c4b56f] text-black font-bold py-3.5 rounded-xl transition-all hover:-translate-y-1 shadow-lg cursor-pointer">
                  Gửi Hướng Dẫn
                </button>
              </form>

              <button
                onClick={onSwitchToLogin}
                className="mt-8 flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm transition-colors cursor-pointer mx-auto"
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
