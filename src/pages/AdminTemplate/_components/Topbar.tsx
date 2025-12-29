import React from "react";
import { FaSignOutAlt, FaHome, FaChevronRight } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "@/store/slices/auth";
import type { AppDispatch, RootState } from "@/store";
import { ROLES } from "@/constants";

interface TopbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Topbar: React.FC<TopbarProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/auth");
  };

  const isSAdmin = user?.role === ROLES.SUPER_ADMIN;

  const getPageTitle = (path: string) => {
    if (path.includes("/admin/events")) return "Event Management";
    if (path.includes("/admin/presenters")) return "Presenter Management";
    if (path.includes("/admin/organizers")) return "Organizer Management";
    if (path.includes("/admin/users")) return "User Management";
    return "Dashboard";
  };

  const currentTitle = getPageTitle(location.pathname);

  return (
    <header className="h-16 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#D8C97B]/20 flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-2 text-sm">
        {currentTitle !== "Dashboard" ? (
          <>
            <Link
              to="/admin"
              className="text-gray-500 hover:text-[#D8C97B] transition-colors flex items-center gap-1 font-medium"
            >
              <FaHome className="mt-0.5" /> Dashboard
            </Link>
            <FaChevronRight className="text-gray-700 text-xs" />
            <span className="text-white font-bold  tracking-wide">
              {currentTitle}
            </span>
          </>
        ) : (
          <span className="text-white font-bold  tracking-wide flex items-center gap-2">
            <FaHome className="mt-0.5 text-[#D8C97B]" /> Dashboard
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-[#D8C97B] font-black font-noto text-sm tracking-wider uppercase">
            {isSAdmin ? "SUPER ADMIN" : "ORGANIZER"}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            {user?.username}
          </span>
        </div>

        <div className="h-8 w-px bg-white/10"></div>

        <button
          onClick={handleLogout}
          className="group flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Đăng xuất"
        >
          <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform text-lg" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
