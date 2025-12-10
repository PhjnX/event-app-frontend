import React from "react";
import { FaIndent, FaOutdent, FaSignOutAlt, FaHome } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "@/store/slices/auth"; // Dùng action logout chuẩn của bạn
import type { AppDispatch } from "@/store";

interface TopbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Topbar: React.FC<TopbarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/auth"); // Hoặc trang login
  };

  return (
    <header className="h-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#B5A65F]/20 flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300">
      {/* Left: Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#B5A65F] text-xl hover:bg-white/5 p-2 rounded-lg transition-colors focus:outline-none"
        >
          {isCollapsed ? <FaIndent /> : <FaOutdent />}
        </button>
        <h1 className="text-white font-noto font-bold text-lg hidden md:block uppercase tracking-wider">
          Hệ thống quản trị
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-[#B5A65F] text-sm font-medium transition-colors"
        >
          <FaHome /> <span className="hidden sm:inline">Trang chủ User</span>
        </Link>

        <div className="h-6 w-px bg-white/10 mx-2"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-sm font-bold"
        >
          <FaSignOutAlt />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
