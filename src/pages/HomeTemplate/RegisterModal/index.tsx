import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaGoogle, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { toast } from "react-toastify"; // Import Toast

// Import Redux
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { registerUser, clearError } from "../../../store/slices/auth";

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

  // Lấy trạng thái loading và error từ Redux
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // State quản lý form
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // State lỗi cục bộ
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset form và lỗi khi mở modal
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

  if (!isOpen) return null;

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (localError) setLocalError(null);
  };

  // Xử lý Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate cơ bản
    if (!formData.username || !formData.email || !formData.password) {
      setLocalError("Vui lòng điền đầy đủ thông tin.");
      toast.warning("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Mật khẩu xác nhận không khớp!");
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    // 2. Gọi API qua Redux Action
    const resultAction = await dispatch(registerUser(formData));

    // 3. Kiểm tra kết quả
    if (registerUser.fulfilled.match(resultAction)) {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      onSwitchToLogin();
    } else {
      // Nếu thất bại, hiển thị toast lỗi từ payload (message của server)
      const errMsg = resultAction.payload as string;
      toast.error(errMsg || "Đăng ký thất bại");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center px-4 font-sans">
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
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#B5A65F] to-transparent"></div>

            <div className="p-8 pt-10">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Tạo Tài Khoản
                </h2>
                <p className="text-gray-400 text-sm">
                  Tham gia cùng chúng tôi ngay hôm nay
                </p>
              </div>

              {/* HIỂN THỊ LỖI */}
              {(error || localError) && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                  {localError || error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleRegister}>
                {/* Các Input Fields giữ nguyên */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#B5A65F] uppercase ml-1">
                    Họ và Tên
                  </label>
                  <div className="relative group">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F] transition-colors" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#B5A65F] uppercase ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F] transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#B5A65F] uppercase ml-1">
                    Mật khẩu
                  </label>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F] transition-colors" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#B5A65F] uppercase ml-1">
                    Nhập lại mật khẩu
                  </label>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F] transition-colors" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  className="w-full bg-[#B5A65F] hover:bg-[#c4b56f] text-black font-bold py-3.5 rounded-xl transition-all hover:-translate-y-1 shadow-lg cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></span>
                      Đang xử lý...
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
                <FaGoogle className="text-red-500 text-lg" />
                <span>Đăng ký với Google</span>
              </button>

              <p className="text-center text-gray-500 text-sm mt-6">
                Đã có tài khoản?{" "}
                <button
                  onClick={onSwitchToLogin}
                  className="text-[#B5A65F] font-bold hover:underline cursor-pointer"
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
