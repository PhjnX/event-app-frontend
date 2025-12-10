import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { ADMIN_MENU } from "@/config/adminMenu";
import logoImage from "@/assets/images/Logo_EMS.png";
import { ROLES } from "@/constants"; 
import { FaCrown } from "react-icons/fa"; 

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Check quyền
  const isSAdmin = user?.role === ROLES.SUPER_ADMIN;

  const filteredMenu = ADMIN_MENU.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <motion.aside
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
      className="h-screen bg-[#0a0a0a] border-r border-[#D8C97B]/20 flex flex-col fixed left-0 top-0 z-50 overflow-hidden shadow-2xl"
    >
      {/* 1. LOGO */}
      <div className="h-20 flex items-center justify-center border-b border-white/5 bg-[#050505]">
        <div className="flex items-center gap-3">
          <img
            src={logoImage}
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-[#D8C97B] font-bold text-xl font-noto whitespace-nowrap overflow-hidden"
              >
                WEBIE ADMIN
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. MENU */}
      <div className="flex-1 py-6 overflow-y-auto px-3 custom-scrollbar">
        <ul className="space-y-2">
          {filteredMenu.map((item) => {
            const isActive = location.pathname.includes(item.path);

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`relative flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden
                    ${
                      isActive
                        ? "bg-linear-to-r from-[#D8C97B] to-[#8E803E] text-black font-bold shadow-[0_0_15px_rgba(181,166,95,0.4)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <div
                    className={`text-xl ${
                      isActive
                        ? "text-black"
                        : "text-[#D8C97B] group-hover:scale-110 transition-transform"
                    }`}
                  >
                    <item.icon />
                  </div>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="whitespace-nowrap"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {isCollapsed && (
                    <div className="absolute left-16 ml-2 px-3 py-1 bg-[#D8C97B] text-black text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                      {item.title}
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 3. USER FOOTER (SỬA Ở ĐÂY) */}
      <div className="p-4 border-t border-white/5 bg-[#050505]">
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          {/* AVATAR LOGIC */}
          <div
            className={`
            w-10 h-10 rounded-full flex items-center justify-center font-bold border transition-all duration-300
            ${
              isSAdmin
                ? "bg-linear-to-br from-red-600 to-red-900 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.6)]" // Style SADMIN
                : "bg-[#D8C97B]/20 text-[#D8C97B] border-[#D8C97B]/50" // Style ORGANIZER
            }
          `}
          >
            {/* Nếu là SAdmin thì hiện Vương Miện, còn lại hiện chữ cái đầu */}
            {isSAdmin ? (
              <FaCrown className="text-sm" />
            ) : (
              user?.username?.charAt(0).toUpperCase() || "U"
            )}
          </div>

          {/* INFO TEXT */}
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h4
                className={`text-sm font-bold truncate ${
                  isSAdmin ? "text-red-500" : "text-white"
                }`}
              >
                {user?.username}
              </h4>
              <p className="text-gray-500 text-[10px] truncate uppercase tracking-wider font-semibold">
                {isSAdmin ? "System Administrator" : user?.role}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
