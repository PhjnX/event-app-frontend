import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./_components/Sidebar";
import Topbar from "./_components/Topbar";
import { useState } from "react";

export default function AdminTemplate() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      {/* 1. SIDEBAR (Bên trái) */}
      <Sidebar isCollapsed={isCollapsed} />

      {/* 2. MAIN AREA (Bên phải) */}
      <main
        className="flex-1 flex flex-col h-full transition-all duration-300 ease-in-out"
        style={{ marginLeft: isCollapsed ? "80px" : "280px" }}
      >
        {/* Topbar */}
        <Topbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        {/* Content Body (Chứa Outlet) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-y-auto p-6 md:p-8 relative custom-scrollbar"
        >
          {/* Background Pattern mờ */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-5"
            style={{
              backgroundImage: "radial-gradient(#B5A65F 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          {/* VỊ TRÍ HIỂN THỊ CÁC TRANG CON */}
          <div className="relative z-10">
            <Outlet />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
