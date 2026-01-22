import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
// Import hook đa ngôn ngữ
import { useTranslation } from "react-i18next";

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
  FaCheck,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "../../../../../assets/images/Logo_EMS.webp";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../../../store";
import { logoutUser } from "../../../../../store/slices/auth";
import { ROLES } from "@/constants";

// ... (Import các Modal giữ nguyên) ...
import LoginModal from "../../modals/LoginModal";
import RegisterModal from "../../modals/RegisterModal";
import ForgotPasswordModal from "../../modals/ForgotPasswordModal";
import ChangePasswordModal from "../../modals/ChangePasswordModal";
import OrganizerRegModal from "../OrganizerRegModal";
import UserNotificationPanel from "../../UserNotificationPanel";

// --- COMPONENT CỜ SVG GIỮ NGUYÊN ---
const FlagVN = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="50" fill="#DA251D" />
    <polygon
      points="50,20 60,45 88,45 65,63 74,90 50,73 26,90 35,63 12,45 40,45"
      fill="#FFFF00"
    />
  </svg>
);
const FlagUS = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask id="us-mask">
      <circle cx="50" cy="50" r="50" fill="white" />
    </mask>
    <g mask="url(#us-mask)">
      <rect x="0" y="0" width="100" height="100" fill="#B22234" />
      <line x1="0" y1="10" x2="100" y2="10" stroke="white" strokeWidth="10" />
      <line x1="0" y1="30" x2="100" y2="30" stroke="white" strokeWidth="10" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="10" />
      <line x1="0" y1="70" x2="100" y2="70" stroke="white" strokeWidth="10" />
      <line x1="0" y1="90" x2="100" y2="90" stroke="white" strokeWidth="10" />
      <rect x="0" y="0" width="45" height="50" fill="#3C3B6E" />
      <g fill="white" fontSize="12">
        <text x="5" y="15">
          ★ ★
        </text>
        <text x="5" y="30">
          ★ ★
        </text>
        <text x="5" y="45">
          ★ ★
        </text>
      </g>
    </g>
  </svg>
);

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", icon: FlagVN },
  { code: "en", label: "English", icon: FlagUS },
];

export default function Header() {
  // KHỞI TẠO HOOK DỊCH
  const { t, i18n } = useTranslation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // KHÔNG CẦN STATE currentLang NỮA, DÙNG TRỰC TIẾP i18n.language
  // Lưu ý: i18n.language có thể trả về 'en-US', nên ta check 'startsWith' hoặc lấy 2 ký tự đầu
  const currentLangCode = i18n.language.substring(0, 2);

  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);

  // ... (Refs và useEffect scroll giữ nguyên) ...
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  // ... (Code Redux giữ nguyên) ...
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [modalType, setModalType] = useState<
    "LOGIN" | "REGISTER" | "FORGOT" | null
  >(null);

  // ... (useEffect check role, scroll handle giữ nguyên) ...
  useEffect(() => {
    // ... (Code scroll cũ)
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setIsUserMenuOpen(false);
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      )
        setIsLangMenuOpen(false);
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
    toast.info(t("msg.logout_success")); // Dùng key dịch thông báo
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  // --- HÀM ĐỔI NGÔN NGỮ CHÍNH ---
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode); // Lệnh đổi ngôn ngữ thực sự
    setIsLangMenuOpen(false);
    // Không cần toast thông báo đổi ngôn ngữ mỗi lần, nếu thích thì dùng:
    toast.success(t("msg.lang_changed"));
  };
  // ------------------------------

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative block py-2 px-3 md:p-0 text-sm font-bold tracking-wide transition-colors duration-300
    after:content-[''] after:absolute after:left-0 after:bottom-[-4px] 
    after:h-[2px] after:w-full after:bg-[#D8C97B] 
    after:transition-transform after:duration-300 after:origin-center
    ${isActive ? "text-[#D8C97B] after:scale-x-100" : "text-white hover:text-[#D8C97B] after:scale-x-0 hover:after:scale-x-100"}`;

  const userInitial = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "U";
  const currentLangObj =
    LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0];
  const CurrentFlagIcon = currentLangObj.icon;

  if (isAuthenticated && user?.role === ROLES.SUPER_ADMIN) return null;

  return (
    <>
      <nav
        className={`font-noto fixed w-full z-50 top-0 start-0 transition-all duration-500 selection:bg-[rgba(216,201,123,0.3)] ${isScrolled ? "bg-black/80 shadow-md py-3 backdrop-blur-md" : "bg-transparent py-5"}`}
      >
        <div className="max-w-[1400px] flex flex-wrap items-center justify-between mx-auto px-4 lg:px-10">
          {/* Logo giữ nguyên */}
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

          {/* MENU DESKTOP - THAY CHỮ CỨNG BẰNG T() */}
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
                  {t("nav.home")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className={getLinkClass}>
                  {t("nav.about")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/value" className={getLinkClass}>
                  {t("nav.values")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/events" className={getLinkClass}>
                  {t("nav.events")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/news" className={getLinkClass}>
                  {t("nav.news")}
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="hidden lg:flex items-center gap-5 lg:order-2">
            {/* --- LANGUAGE SWITCHER DESKTOP --- */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-full border transition-all duration-300 group ${isLangMenuOpen ? "border-[#D8C97B] bg-[#D8C97B]/10" : "border-transparent hover:bg-white/5"}`}
              >
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-sm group-hover:border-[#D8C97B] transition-colors">
                  <CurrentFlagIcon className="w-full h-full object-cover" />
                </div>
                <span
                  className={`text-sm font-bold uppercase transition-colors ${isLangMenuOpen ? "text-[#D8C97B]" : "text-gray-300 group-hover:text-[#D8C97B]"}`}
                >
                  {currentLangCode}
                </span>
                <FaChevronDown
                  className={`text-[10px] text-gray-400 transition-all duration-300 ${isLangMenuOpen ? "rotate-180 text-[#D8C97B]" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-44 bg-[#1a1a1a] border border-[#D8C97B]/30 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden z-50 backdrop-blur-xl"
                  >
                    <div className="py-1.5">
                      <p className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Chọn ngôn ngữ
                      </p>
                      {LANGUAGES.map((lang) => {
                        const Flag = lang.icon;
                        const isSelected = currentLangCode === lang.code;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all group ${isSelected ? "bg-[#D8C97B]/10 text-[#D8C97B] font-bold" : "text-gray-300 hover:bg-white/5 hover:text-[#D8C97B]"}`}
                          >
                            <span className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-full overflow-hidden border ${isSelected ? "border-[#D8C97B]" : "border-gray-500 group-hover:border-[#D8C97B]"} transition-colors`}
                              >
                                <Flag className="w-full h-full object-cover" />
                              </div>
                              {lang.label}
                            </span>
                            {isSelected && <FaCheck className="text-xs" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsOrgModalOpen(true)}
                  className="group relative px-7 py-2.5 rounded-full overflow-hidden bg-linear-to-r from-[#D8C97B] to-[#F0E6A1] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(216,201,123,0.4)] transition-all duration-300 hover:shadow-[0_0_35px_rgba(216,201,123,0.7)] hover:scale-105 active:scale-95"
                >
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-linear-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
                  <div className="relative flex items-center gap-2 z-10">
                    <FaPaperPlane className="text-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1" />
                    <span className="tracking-wide">{t("nav.contact")}</span>
                  </div>
                </button>
                <button
                  onClick={openLogin}
                  className="px-6 py-2.5 rounded-full border border-[#D8C97B] text-[#D8C97B] font-bold text-sm transition-all duration-300 hover:bg-[#D8C97B]/10 hover:text-white cursor-pointer"
                >
                  {t("nav.login")}
                </button>
              </>
            ) : (
              <>
                <UserNotificationPanel />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 focus:outline-none group"
                  >
                    {/* ... (Avatar logic giữ nguyên) ... */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-[0_0_10px_rgba(181,166,95,0.5)] group-hover:shadow-[0_0_15px_rgba(181,166,95,0.8)] transition-all overflow-hidden border border-[#D8C97B] ${user?.avatarUrl ? "bg-black" : "bg-linear-to-br from-[#D8C97B] to-[#8E803E]"}`}
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
                    {/* ... */}
                    <FaChevronDown
                      className={`text-white text-xs transition-transform duration-300 group-hover:text-[#D8C97B] ${isUserMenuOpen ? "rotate-180" : ""}`}
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
                              <FaTachometerAlt /> {t("nav.dashboard")}
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
                              <FaBuilding /> {t("nav.partner_reg")}
                            </button>
                          )}
                          <Link
                            to="/my-tickets"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[rgba(216,201,123,0.1)] hover:text-[#D8C97B] transition-colors"
                          >
                            <FaTicketAlt /> {t("nav.my_tickets")}
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[rgba(216,201,123,0.1)] hover:text-[#D8C97B] transition-colors"
                          >
                            <FaUser /> {t("nav.profile")}
                          </Link>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsChangePassModalOpen(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[rgba(216,201,123,0.1)] hover:text-[#D8C97B] transition-colors text-left"
                          >
                            <FaLock /> {t("nav.change_pass")}
                          </button>
                          <div className="my-1 border-t border-white/5 mx-2"></div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[rgba(239,68,68,0.1)] hover:text-red-500 transition-colors text-left"
                          >
                            <FaSignOutAlt /> {t("nav.logout")}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`lg:hidden bg-[#0a0a0a]/95 backdrop-blur-xl absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-in-out border-t border-[rgba(255,255,255,0.1)] ${isMobileMenuOpen ? "max-h-screen py-8 opacity-100 shadow-2xl" : "max-h-0 opacity-0"}`}
        >
          <ul className="flex flex-col items-center gap-6 text-white text-lg">
            {/* User Info Mobile giữ nguyên */}
            {isAuthenticated && (
              <div className="flex flex-col items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {/* ... avatar ... */}
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
                <div
                  className="mt-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserNotificationPanel />
                </div>
              </div>
            )}

            {/* MAP NAVIGATION ITEMS (DÙNG KEY ĐỂ DỊCH) */}
            {[
              { path: "/", label: t("nav.home") },
              { path: "/about", label: t("nav.about") },
              { path: "/value", label: t("nav.values") },
              { path: "/events", label: t("nav.events") },
              { path: "/news", label: t("nav.news") },
            ].map((item, index) => (
              <li key={index} className="w-full text-center">
                <NavLink
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block py-2 text-lg font-medium transition-colors ${isActive ? "text-[#D8C97B]" : "text-white hover:text-[#D8C97B]"}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}

            {/* LANGUAGE SWITCHER MOBILE */}
            <li className="w-full flex justify-center gap-3 py-3">
              {LANGUAGES.map((lang) => {
                const Flag = lang.icon;
                const isSelected = currentLangCode === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${isSelected ? "bg-[#D8C97B] text-black border-[#D8C97B] shadow-[0_0_10px_rgba(216,201,123,0.4)]" : "border-white/20 text-gray-400 hover:border-[#D8C97B] hover:text-[#D8C97B]"}`}
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden shadow-sm">
                      <Flag className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-bold">{lang.label}</span>
                  </button>
                );
              })}
            </li>

            <div className="w-3/4 h-px bg-linear-to-r from-transparent via-white/10 to-transparent my-2"></div>

            {/* BUTTONS LOGIN/LOGOUT MOBILE (Thay text bằng t()) */}
            <div className="flex flex-col gap-4 w-full px-8">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsOrgModalOpen(true);
                    }}
                    className="w-full py-3 rounded-xl bg-linear-to-r from-[#D8C97B] to-[#F0E6A1] text-black font-extrabold uppercase tracking-wide flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(216,201,123,0.5)] transition-all"
                  >
                    <FaPaperPlane /> {t("nav.contact")}
                  </button>
                  <button
                    onClick={openLogin}
                    className="w-full py-3 border border-[#D8C97B] text-[#D8C97B] rounded-xl font-bold uppercase tracking-wide hover:bg-[#D8C97B]/10 transition-all"
                  >
                    {t("nav.login")}
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
                      <FaTachometerAlt className="inline mr-2" />{" "}
                      {t("nav.dashboard")}
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
                      <FaBuilding className="inline mr-2" />{" "}
                      {t("nav.partner_reg")}
                    </button>
                  )}
                  <Link
                    to="/my-tickets"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-3 border border-[rgba(255,255,255,0.1)] bg-white/5 text-white rounded-xl font-medium"
                  >
                    {t("nav.my_tickets")}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-3 border border-[rgba(255,255,255,0.1)] bg-white/5 text-white rounded-xl font-medium"
                  >
                    {t("nav.profile")}
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsChangePassModalOpen(true);
                    }}
                    className="w-full text-center py-3 border border-[rgba(255,255,255,0.1)] bg-white/5 text-white rounded-xl font-medium"
                  >
                    {t("nav.change_pass")}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-3 bg-[rgba(239,68,68,0.1)] text-red-500 border border-[rgba(239,68,68,0.2)] rounded-xl font-bold"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              )}
            </div>
          </ul>
        </div>
      </nav>
      {/* ... Modals giữ nguyên ... */}
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
