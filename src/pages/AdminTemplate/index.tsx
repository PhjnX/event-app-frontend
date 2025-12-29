import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./_components/Sidebar";
import Topbar from "./_components/Topbar";

export default function AdminTemplate() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className="flex-1 flex flex-col h-full transition-all duration-300 ease-in-out"
        style={{ marginLeft: "80px" }} 
      >
        <Topbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-y-auto p-6 md:p-8 relative custom-scrollbar"
        >
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-5"
            style={{
              backgroundImage: "radial-gradient(#D8C97B 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          <div className="relative z-10">
            <Outlet />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
