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
import logoImage from "../../../../assets/images/Logo_EMS.png";
import { toast } from "react-toastify"; // Import Toast

// Import Redux
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../../store";
import { logoutUser } from "../../../../store/slices/auth";

// Import Modals
import LoginModal from "../../LoginModal";
import RegisterModal from "../../RegisterModal";
import ForgotPasswordModal from "../../ForgotPasswordModal";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State quản lý Dropdown User
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Redux & Router
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // State quản lý 3 modal
  const [modalType, setModalType] = useState<
    "LOGIN" | "REGISTER" | "FORGOT" | null
  >(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    // Click outside để đóng dropdown user
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
    // Gọi action logout
    await dispatch(logoutUser());
    toast.info("Đã đăng xuất 👋"); // Hiện toast thông báo
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/"); // Về trang chủ
  };

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative block py-2 px-3 md:p-0 text-sm font-bold tracking-wide transition-colors duration-300
    after:content-[''] after:absolute after:left-0 after:bottom-[-4px] 
    after:h-[2px] after:w-full after:bg-[#B5A65F] 
    after:transition-transform after:duration-300 after:origin-center
    ${
      isActive
        ? "text-[#B5A65F] after:scale-x-100"
        : "text-white hover:text-[#B5A65F] after:scale-x-0 hover:after:scale-x-100"
    }`;

  // Helper: Lấy chữ cái đầu của tên User để làm Avatar
  const userInitial = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "U";

  return (
    <>
      <nav
        className={`fixed w-full z-50 top-0 start-0 transition-all duration-500 ${
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
            className="lg:hidden text-white text-2xl focus:outline-none hover:text-[#B5A65F] transition-colors cursor-pointer"
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
                <NavLink to="/giai-phap" className={getLinkClass}>
                  Giải pháp
                </NavLink>
              </li>
              <li>
                <NavLink to="/tai-nguyen" className={getLinkClass}>
                  Tài nguyên
                </NavLink>
              </li>
              <li>
                <NavLink to="/ho-tro" className={getLinkClass}>
                  Hỗ trợ
                </NavLink>
              </li>
              <li>
                <NavLink to="/cong-ty" className={getLinkClass}>
                  Công ty
                </NavLink>
              </li>
              <li>
                <NavLink to="/su-kien" className={getLinkClass}>
                  Sự Kiện
                </NavLink>
              </li>
              {/* Ẩn nút Đăng ký trên menu nếu đã đăng nhập (tuỳ chọn) */}
              {!isAuthenticated && (
                <li>
                  <NavLink to="/dang-ky" className={getLinkClass}>
                    Đăng Ký
                  </NavLink>
                </li>
              )}
            </ul>
          </div>

          <div className="hidden lg:flex items-center gap-4 lg:order-2">
            {/* LOGIC ĐỔI GIAO DIỆN KHI LOGIN */}
            {!isAuthenticated ? (
              // --- CHƯA ĐĂNG NHẬP ---
              <>
                <Link
                  to="/lien-he"
                  className="px-5 py-2.5 rounded-full border border-[#B5A65F] text-[#B5A65F] font-bold text-sm transition-all duration-300 hover:bg-[#B5A65F] hover:text-black cursor-pointer"
                >
                  Liên hệ
                </Link>

                <button
                  onClick={openLogin}
                  className="px-6 py-2.5 rounded-full bg-[#B5A65F] text-black font-bold text-sm shadow-[0_0_15px_-3px_rgba(181,166,95,0.4)] transition-all duration-300 hover:bg-[#dac873] hover:shadow-[0_0_20px_-3px_rgba(181,166,95,0.6)] hover:-translate-y-0.5 cursor-pointer"
                >
                  Đăng nhập
                </button>
              </>
            ) : (
              // --- ĐÃ ĐĂNG NHẬP (AVATAR + DROPDOWN) ---
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 focus:outline-none group"
                >
                  {/* Avatar Tròn */}
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#B5A65F] to-[#8E803E] flex items-center justify-center text-black font-bold text-lg shadow-[0_0_10px_rgba(181,166,95,0.5)] group-hover:shadow-[0_0_15px_rgba(181,166,95,0.8)] transition-all">
                    {userInitial}
                  </div>
                  {/* Tên User & Mũi tên */}
                  <div className="hidden xl:flex flex-col items-start">
                    <span className="text-white text-xs font-medium max-w-[100px] truncate">
                      {user?.username || "User"}
                    </span>
                    <span className="text-[10px] text-[#B5A65F]">
                      Thành viên
                    </span>
                  </div>
                  <FaChevronDown
                    className={`text-white text-xs transition-transform duration-300 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-[#1a1a1a] border border-[#B5A65F]/30 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      {/* Header Dropdown */}
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm text-white font-bold truncate">
                          {user?.username}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>

                      {/* List Items */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[#B5A65F]/10 hover:text-[#B5A65F] transition-colors"
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
            {/* Nếu đã đăng nhập thì hiện Info User ở đầu menu mobile */}
            {isAuthenticated && (
              <div className="flex flex-col items-center gap-2 mb-2">
                <div className="w-16 h-16 rounded-full bg-[#B5A65F] flex items-center justify-center text-black font-bold text-2xl">
                  {userInitial}
                </div>
                <span className="font-bold text-[#B5A65F]">
                  {user?.username}
                </span>
              </div>
            )}

            <li>
              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-[#B5A65F]"
              >
                Trang Chủ
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/giai-phap"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-[#B5A65F]"
              >
                Giải pháp
              </NavLink>
            </li>
            {/* Các link khác ... */}

            <div className="w-full h-px bg-white/10 my-2"></div>

            <div className="flex flex-col gap-4 w-full px-10">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/lien-he"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-3 border border-[#B5A65F] text-[#B5A65F] rounded-lg font-bold cursor-pointer"
                  >
                    Liên hệ
                  </Link>
                  <button
                    onClick={openLogin}
                    className="w-full text-center py-3 bg-[#B5A65F] text-black rounded-lg font-bold cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-3 border border-white/20 text-white rounded-lg font-medium cursor-pointer hover:border-[#B5A65F] hover:text-[#B5A65F]"
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

      {/* RENDER MODALS */}
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
