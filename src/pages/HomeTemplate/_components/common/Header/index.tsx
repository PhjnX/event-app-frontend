import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaTachometerAlt,
  FaBuilding,
  FaLock,
  FaTicketAlt,
  FaPaperPlane,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "../../../../../assets/images/Logo_EMS.png";
import { toast } from "react-toastify";

import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../../../store";
import { logoutUser } from "../../../../../store/slices/auth";
import { ROLES } from "@/constants";

import LoginModal from "../../modals/LoginModal";
import RegisterModal from "../../modals/RegisterModal";
import ForgotPasswordModal from "../../modals/ForgotPasswordModal";
import ChangePasswordModal from "../../modals/ChangePasswordModal";

import OrganizerRegModal from "../OrganizerRegModal";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);

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
    if (isAuthenticated && user?.role === ROLES.SUPER_ADMIN) {
      window.location.href = "/admin/dashboard";
    }
  }, [isAuthenticated, user]);

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

  if (isAuthenticated && user?.role === ROLES.SUPER_ADMIN) return null;

  return (
    <>
      <nav
        className={`font-noto fixed w-full z-50 top-0 start-0 transition-all duration-500 selection:bg-[rgba(216,201,123,0.3)] ${
          isScrolled
            ? "bg-[#0a0a0a]/90 shadow-md py-3 backdrop-blur-md"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1400px] flex flex-wrap items-center justify-between mx-auto px-4 lg:px-10">
          <Link
            to="/"
            className="flex items-center space-x-3 rtl:space-x-reverse group"
          >
            <img
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
                <NavLink
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  to="/"
                  className={getLinkClass}
                >
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
                <NavLink to="/events" className={getLinkClass}>
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

          <div className="hidden lg:flex items-center gap-5 lg:order-2">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsOrgModalOpen(true)}
                  className="group relative px-7 py-2.5 rounded-full overflow-hidden bg-linear-to-r from-[#D8C97B] to-[#F0E6A1] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(216,201,123,0.4)] transition-all duration-300 hover:shadow-[0_0_35px_rgba(216,201,123,0.7)] hover:scale-105 active:scale-95"
                >
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-linear-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />

                  <div className="relative flex items-center gap-2 z-10">
                    <FaPaperPlane className="text-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1" />
                    <span className="tracking-wide">Liên hệ</span>
                  </div>
                </button>

                <button
                  onClick={openLogin}
                  className="px-6 py-2.5 rounded-full border border-[#D8C97B] text-[#D8C97B] font-bold text-sm transition-all duration-300 hover:bg-[#D8C97B]/10 hover:text-white cursor-pointer"
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
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-[0_0_10px_rgba(181,166,95,0.5)] group-hover:shadow-[0_0_15px_rgba(181,166,95,0.8)] transition-all overflow-hidden border border-[#D8C97B] 
                    ${
                      user?.avatarUrl
                        ? "bg-black"
                        : "bg-linear-to-br from-[#D8C97B] to-[#8E803E]"
                    }`}
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="pb-0.5">{userInitial}</span>
                    )}
                  </div>

                  <div className="hidden xl:flex flex-col items-start text-left">
                    <span className="text-white text-xs font-medium max-w-[100px] truncate group-hover:text-[#D8C97B] transition-colors">
                      {user?.username || "User"}
                    </span>
                    <span className="text-[10px] text-[#D8C97B]/80">
                      {user?.role === ROLES.ORGANIZER
                        ? "Nhà Tổ Chức"
                        : "Thành viên"}
                    </span>
                  </div>
                  <FaChevronDown
                    className={`text-white text-xs transition-transform duration-300 group-hover:text-[#D8C97B] ${
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
                      className="absolute right-0 mt-4 w-64 bg-[#1a1a1a] border border-[rgba(216,201,123,0.3)] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.1)] bg-white/2">
                        <p className="text-sm text-white font-bold truncate">
                          {user?.username}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <div className="py-2">
                        {user?.role === ROLES.ORGANIZER && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-[#D8C97B] hover:bg-[rgba(216,201,123,0.1)] font-bold transition-colors border-b border-[rgba(255,255,255,0.05)]"
                          >
                            <FaTachometerAlt /> Trang quản lý
                          </Link>
                        )}
                        {user?.role !== ROLES.ORGANIZER && (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsOrgModalOpen(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#D8C97B] hover:bg-[rgba(216,201,123,0.1)] transition-colors text-left border-b border-[rgba(255,255,255,0.05)] font-bold"
                          >
                            <FaBuilding /> Đăng ký Đối tác
                          </button>
                        )}
                        <Link
                          to="/my-tickets"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[rgba(216,201,123,0.1)] hover:text-[#D8C97B] transition-colors"
                        >
                          <FaTicketAlt /> Vé của tôi
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[rgba(216,201,123,0.1)] hover:text-[#D8C97B] transition-colors"
                        >
                          <FaUser /> Thông tin cá nhân
                        </Link>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsChangePassModalOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[rgba(216,201,123,0.1)] hover:text-[#D8C97B] transition-colors text-left"
                        >
                          <FaLock /> Đổi mật khẩu
                        </button>
                        <div className="my-1 border-t border-white/5 mx-2"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[rgba(239,68,68,0.1)] hover:text-red-500 transition-colors text-left"
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

        <div
          className={`lg:hidden bg-[#0a0a0a]/95 backdrop-blur-xl absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-in-out border-t border-[rgba(255,255,255,0.1)] ${
            isMobileMenuOpen
              ? "max-h-screen py-8 opacity-100 shadow-2xl"
              : "max-h-0 opacity-0"
          }`}
        >
          <ul className="flex flex-col items-center gap-6 text-white text-lg">
            {isAuthenticated && (
              <div className="flex flex-col items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="w-20 h-20 rounded-full bg-[#D8C97B] flex items-center justify-center text-black font-bold text-3xl overflow-hidden border-2 border-[#D8C97B] shadow-lg">
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
                <span className="font-bold text-[#D8C97B] text-xl">
                  {user?.username}
                </span>
              </div>
            )}

            {["Trang Chủ", "Về Chúng Tôi", "Giá Trị", "Sự Kiện", "Tin Tức"].map(
              (item, index) => {
                const paths = ["/", "/about", "/value", "/events", "/news"];
                return (
                  <li key={index} className="w-full text-center">
                    <NavLink
                      to={paths[index]}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block py-2 text-lg font-medium transition-colors ${
                          isActive
                            ? "text-[#D8C97B]"
                            : "text-white hover:text-[#D8C97B]"
                        }`
                      }
                    >
                      {item}
                    </NavLink>
                  </li>
                );
              }
            )}

            <div className="w-3/4 h-px bg-linear-to-r from-transparent via-white/10 to-transparent my-2"></div>

            <div className="flex flex-col gap-4 w-full px-8">
              {!isAuthenticated ? (
                <>
                  {/* BUTTON MOBILE CŨNG STYLE LẠI LUÔN */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsOrgModalOpen(true);
                    }}
                    className="w-full py-3 rounded-xl bg-linear-to-r from-[#D8C97B] to-[#F0E6A1] text-black font-extrabold uppercase tracking-wide flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(216,201,123,0.5)] transition-all"
                  >
                    <FaPaperPlane /> Liên hệ Hợp tác
                  </button>
                  <button
                    onClick={openLogin}
                    className="w-full py-3 border border-[#D8C97B] text-[#D8C97B] rounded-xl font-bold uppercase tracking-wide hover:bg-[#D8C97B]/10 transition-all"
                  >
                    Đăng nhập
                  </button>
                </>
              ) : (
                <>
                  {user?.role === ROLES.ORGANIZER && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full text-center py-3 border border-[#D8C97B] text-[#D8C97B] rounded-xl font-bold hover:bg-[#D8C97B] hover:text-black transition-all"
                    >
                      <FaTachometerAlt className="inline mr-2" /> Trang quản lý
                    </Link>
                  )}
                  {user?.role !== ROLES.ORGANIZER && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsOrgModalOpen(true);
                      }}
                      className="w-full text-center py-3 border border-[#D8C97B] text-[#D8C97B] rounded-xl font-bold hover:bg-[#D8C97B] hover:text-black transition-all"
                    >
                      <FaBuilding className="inline mr-2" /> Đăng ký Đối tác
                    </button>
                  )}
                  <Link
                    to="/my-tickets"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-3 border border-[rgba(255,255,255,0.1)] bg-white/5 text-white rounded-xl font-medium"
                  >
                    Vé của tôi
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-3 border border-[rgba(255,255,255,0.1)] bg-white/5 text-white rounded-xl font-medium"
                  >
                    Thông tin cá nhân
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsChangePassModalOpen(true);
                    }}
                    className="w-full text-center py-3 border border-[rgba(255,255,255,0.1)] bg-white/5 text-white rounded-xl font-medium"
                  >
                    Đổi mật khẩu
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-3 bg-[rgba(239,68,68,0.1)] text-red-500 border border-[rgba(239,68,68,0.2)] rounded-xl font-bold"
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

      <OrganizerRegModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isChangePassModalOpen}
        onClose={() => setIsChangePassModalOpen(false)}
      />
    </>
  );
}
