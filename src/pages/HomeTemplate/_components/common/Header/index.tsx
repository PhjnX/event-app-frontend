import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "../../../../../assets/images/Logo_EMS.png";
import { toast } from "react-toastify";

import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../../../store";
import { logoutUser } from "../../../../../store/slices/auth";

import LoginModal from "../../modals/LoginModal";
import RegisterModal from "../../modals/RegisterModal";
import ForgotPasswordModal from "../../modals/ForgotPasswordModal";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [modalType, setModalType] = useState<
    "LOGIN" | "REGISTER" | "FORGOT" | null
  >(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openLogin = () => {
    setModalType("LOGIN");
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.info("Đã đăng xuất 👋");
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative block py-2 px-3 md:p-0 text-sm font-bold tracking-wide transition-colors duration-300
    after:content-[''] after:absolute after:left-0 after:bottom-[-4px] 
    after:h-[2px] after:w-full after:bg-[#D8C97B] 
    after:transition-transform after:duration-300 after:origin-center
    ${
      isActive
        ? "text-[#D8C97B] after:scale-x-100"
        : "text-white hover:text-[#D8C97B] after:scale-x-0 hover:after:scale-x-100"
    }`;

  const userInitial = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "U";

  return (
    <>
      <nav
        className={`font-noto fixed w-full z-50 top-0 start-0 transition-all duration-500 ${
          isScrolled
            ? "bg-black/40 shadow-md py-3 backdrop-blur-none"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1400px] flex flex-wrap items-center justify-between mx-auto px-4 lg:px-10">
          <Link
            to="/"
            className="flex items-center space-x-3 rtl:space-x-reverse group"
          >
            <img
              src={logoImage}
              className="h-12 md:h-14 w-auto transition-transform duration-300 group-hover:-translate-y-1 drop-shadow-md"
              alt="Logo"
            />
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white text-2xl focus:outline-none hover:text-[#D8C97B] transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div
            className="hidden lg:flex lg:w-auto lg:order-1"
            id="navbar-sticky"
          >
            <ul className="flex flex-col p-4 lg:p-0 mt-4 font-medium lg:space-x-8 rtl:space-x-reverse lg:flex-row lg:mt-0 lg:border-0 bg-transparent">
              <li>
                <NavLink to="/" className={getLinkClass}>
                  Trang Chủ
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className={getLinkClass}>
                  Về Chúng Tôi
                </NavLink>
              </li>
              <li>
                <NavLink to="/value" className={getLinkClass}>
                  Giá Trị
                </NavLink>
              </li>
              <li>
                <NavLink to="/event" className={getLinkClass}>
                  Sự Kiện
                </NavLink>
              </li>
              <li>
                <NavLink to="/news" className={getLinkClass}>
                  Tin Tức
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="hidden lg:flex items-center gap-4 lg:order-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/lien-he"
                  className="px-5 py-2.5 rounded-full border border-[#D8C97B] text-[#D8C97B] font-bold text-sm transition-all duration-300 hover:bg-[#D8C97B] hover:text-black cursor-pointer"
                >
                  Liên hệ
                </Link>

                <button
                  onClick={openLogin}
                  className="px-6 py-2.5 rounded-full bg-[#D8C97B] text-black font-bold text-sm shadow-[0_0_15px_-3px_rgba(181,166,95,0.4)] transition-all duration-300 hover:bg-[#dac873] hover:shadow-[0_0_20px_-3px_rgba(181,166,95,0.6)] hover:-translate-y-0.5 cursor-pointer"
                >
                  Đăng nhập
                </button>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 focus:outline-none group"
                >
                  {/* --- SỬA Ở ĐÂY: Logic hiển thị ảnh avatar --- */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-[0_0_10px_rgba(181,166,95,0.5)] group-hover:shadow-[0_0_15px_rgba(181,166,95,0.8)] transition-all overflow-hidden border border-[#D8C97B] 
  ${
    user?.avatarUrl ? "bg-black" : "bg-linear-to-br from-[#D8C97B] to-[#8E803E]"
  }`}
                  >
                    {/* LOGIC: Có ảnh thì hiện ảnh, không thì hiện chữ */}
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="User"
                        className="w-full h-full object-cover" // Dùng object-cover để ảnh lấp đầy khung tròn
                      />
                    ) : (
                      // Nếu không có ảnh, hiện chữ cái đầu trên nền vàng
                      <span className="pb-0.5">{userInitial}</span>
                    )}
                  </div>
                  {/* ------------------------------------------- */}

                  <div className="hidden xl:flex flex-col items-start">
                    <span className="text-white text-xs font-medium max-w-[100px] truncate">
                      {user?.username || "User"}
                    </span>
                    <span className="text-[10px] text-[#D8C97B]">
                      Thành viên
                    </span>
                  </div>
                  <FaChevronDown
                    className={`text-white text-xs transition-transform duration-300 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-[#1a1a1a] border border-[#D8C97B]/30 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm text-white font-bold truncate">
                          {user?.username}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[#D8C97B]/10 hover:text-[#D8C97B] transition-colors"
                        >
                          <FaUser /> Thông tin cá nhân
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors text-left"
                        >
                          <FaSignOutAlt /> Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`lg:hidden bg-black/95 backdrop-blur-xl absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-in-out border-t border-white/10 ${
            isMobileMenuOpen
              ? "max-h-screen py-6 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <ul className="flex flex-col items-center gap-6 text-white text-lg">
            {isAuthenticated && (
              <div className="flex flex-col items-center gap-2 mb-2">
                {/* --- SỬA Ở ĐÂY CHO MOBILE: Avatar hiển thị ảnh --- */}
                <div className="w-16 h-16 rounded-full bg-[#D8C97B] flex items-center justify-center text-black font-bold text-2xl overflow-hidden border-2 border-[#D8C97B]">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                {/* ------------------------------------------------ */}
                <span className="font-bold text-[#D8C97B]">
                  {user?.username}
                </span>
              </div>
            )}

            <li>
              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-[#D8C97B]"
              >
                Trang Chủ
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-[#D8C97B]"
              >
                Về Chúng Tôi
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/value"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-[#D8C97B]"
              >
                Giá Trị
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/event"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-[#D8C97B]"
              >
                Sự Kiện
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/news"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-[#D8C97B]"
              >
                Tin Tức
              </NavLink>
            </li>

            <div className="w-full h-px bg-white/10 my-2"></div>

            <div className="flex flex-col gap-4 w-full px-10">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/lien-he"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-3 border border-[#D8C97B] text-[#D8C97B] rounded-lg font-bold cursor-pointer"
                  >
                    Liên hệ
                  </Link>
                  <button
                    onClick={openLogin}
                    className="w-full text-center py-3 bg-[#D8C97B] text-black rounded-lg font-bold cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-3 border border-white/20 text-white rounded-lg font-medium cursor-pointer hover:border-[#D8C97B] hover:text-[#D8C97B]"
                  >
                    Thông tin cá nhân
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg font-bold cursor-pointer hover:bg-red-500 hover:text-white"
                  >
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
          </ul>
        </div>
      </nav>

      <LoginModal
        isOpen={modalType === "LOGIN"}
        onClose={() => setModalType(null)}
        onSwitchToRegister={() => setModalType("REGISTER")}
        onSwitchToForgot={() => setModalType("FORGOT")}
      />

      <RegisterModal
        isOpen={modalType === "REGISTER"}
        onClose={() => setModalType(null)}
        onSwitchToLogin={() => setModalType("LOGIN")}
      />

      <ForgotPasswordModal
        isOpen={modalType === "FORGOT"}
        onClose={() => setModalType(null)}
        onSwitchToLogin={() => setModalType("LOGIN")}
      />
    </>
  );
}
