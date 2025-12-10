import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaEnvelope } from "react-icons/fa";

// Import Actions & Types
import { loginUser } from "@/store/slices/auth";
import type { AppDispatch, RootState } from "@/store";
import { ROLES } from "@/constants";

// Import Assets & Components
import logoImage from "@/assets/images/Logo_EMS.png"; // Đảm bảo đường dẫn đúng
import LoadingScreen from "@/pages/HomeTemplate/_components/common/LoadingSrceen"; // Import Loading xịn của bạn

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const { isLoading, error, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(loginUser(formData));
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ORGANIZER) {
        if (!from || from === "/" || from === "/dang-nhap") {
          navigate("/admin", { replace: true });
        } else if (from.startsWith("/admin")) {
          navigate(from, { replace: true });
        } else {
          navigate("/admin", { replace: true });
        }
      } else {
        if (from && from.includes("/admin")) {
          navigate("/", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] overflow-hidden font-noto text-white">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(181, 166, 95, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(181, 166, 95, 0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#B5A65F]/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#B5A65F]/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* --- LOGIN CARD --- */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 md:p-10"
      >
        {/* Glassmorphism Container */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-[#B5A65F]/30 rounded-3xl shadow-[0_0_40px_-10px_rgba(181,166,95,0.15)]"></div>

        <div className="relative z-20 flex flex-col items-center">
          {/* Logo */}
          <div className="mb-8">
            <img
              src={logoImage}
              alt="Logo"
              className="h-16 w-auto drop-shadow-[0_0_10px_rgba(181,166,95,0.5)]"
            />
          </div>

          <h2 className="text-3xl font-bold text-center mb-2 text-white uppercase tracking-wide">
            Chào mừng trở lại
          </h2>
          <p className="text-gray-400 text-sm mb-8 text-center font-light">
            Đăng nhập để truy cập hệ thống quản trị Webie
          </p>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="w-full mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg text-center font-medium"
            >
              {typeof error === "string"
                ? error
                : "Thông tin đăng nhập không chính xác"}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#B5A65F] uppercase tracking-widest ml-1">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-500 group-focus-within:text-[#B5A65F] transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#B5A65F] focus:ring-1 focus:ring-[#B5A65F] transition-all placeholder-gray-600"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#B5A65F] uppercase tracking-widest ml-1">
                Mật khẩu
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-500 group-focus-within:text-[#B5A65F] transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#B5A65F] focus:ring-1 focus:ring-[#B5A65F] transition-all placeholder-gray-600"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading} // Lúc này isLoading = false mới hiện nút, true thì đã return LoadingScreen ở trên rồi
              className="w-full py-3.5 mt-4 bg-linear-to-r from-[#B5A65F] to-[#8E803E] hover:to-[#B5A65F] text-black font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(181,166,95,0.4)] transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
