import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { ADMIN_MENU } from "@/config/adminMenu";
import logoImage from "@/assets/images/Logo_EMS.png";
import { ROLES } from "@/constants";
import { FaCrown, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

 
  const showFull = !isCollapsed || isHovered;

  const isSAdmin = user?.role === ROLES.SUPER_ADMIN;

  const filteredMenu = ADMIN_MENU.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <motion.aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={false}
      animate={{
        width: showFull ? 280 : 80,
        backgroundColor: isHovered ? "#0f0f0f" : "#0a0a0a", 
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed left-0 top-0 h-screen border-r border-[#D8C97B]/20 flex flex-col z-50 overflow-hidden shadow-2xl
        ${
          isHovered
            ? "shadow-[10px_0_40px_rgba(0,0,0,0.8)] border-[#D8C97B]/40"
            : ""
        }
      `}
    >
      <div className="h-20 flex items-center justify-center border-b border-white/5 shrink-0 relative">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <img
            src={logoImage}
            alt="Logo"
            className="w-10 h-10 object-contain shrink-0"
          />

          <AnimatePresence>
            {showFull && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-[#D8C97B] font-bold text-xl font-noto"
              >
                WEBIE ADMIN
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showFull && isHovered && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-[#D8C97B] bg-black/50 rounded hover:bg-white/10 transition-colors"
              title={isCollapsed ? "Ghim Sidebar" : "Thu gọn Sidebar"}
            >
              {isCollapsed ? (
                <FaAngleDoubleRight size={12} />
              ) : (
                <FaAngleDoubleLeft size={12} />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 py-6 overflow-y-auto px-3 custom-scrollbar overflow-x-hidden">
        <ul className="space-y-2">
          {filteredMenu.map((item) => {
            const isActive = location.pathname.includes(item.path);

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`relative flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all duration-200 group overflow-hidden whitespace-nowrap
                    ${
                      isActive
                        ? "bg-linear-to-r from-[#D8C97B] to-[#8E803E] text-black font-bold shadow-[0_0_15px_rgba(181,166,95,0.4)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <div
                    className={`text-xl shrink-0 w-6 text-center transition-transform duration-300 ${
                      isActive
                        ? "text-black scale-110"
                        : "text-[#D8C97B] group-hover:scale-110"
                    }`}
                  >
                    <item.icon />
                  </div>

                  <AnimatePresence>
                    {showFull && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>

                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-white/5 bg-[#050505] shrink-0">
        <div
          className={`flex items-center ${
            showFull ? "gap-3" : "justify-center"
          } transition-all duration-300 overflow-hidden`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border shrink-0 transition-all duration-300
            ${
              isSAdmin
                ? "bg-linear-to-br from-red-600 to-red-900 text-white border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                : "bg-[#D8C97B]/20 text-[#D8C97B] border-[#D8C97B]/50"
            }
          `}
          >
            {isSAdmin ? (
              <FaCrown className="text-sm" />
            ) : (
              user?.username?.charAt(0).toUpperCase() || "U"
            )}
          </div>

          <AnimatePresence>
            {showFull && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h4
                  className={`text-sm font-bold truncate ${
                    isSAdmin ? "text-red-500" : "text-white"
                  }`}
                >
                  {user?.username}
                </h4>
                <p className="text-gray-500 text-[10px] truncate uppercase tracking-wider font-semibold">
                  {isSAdmin ? "Administrator" : user?.role}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
