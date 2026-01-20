import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./_components/Sidebar";
import Topbar from "./_components/Topbar";

export default function AdminTemplate() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const sidebarWidth = isCollapsed ? "80px" : "260px";

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-noto selection:bg-[#B5A65F] selection:text-black">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className="flex-1 flex flex-col h-full transition-all duration-300 ease-in-out relative"
        style={{ marginLeft: sidebarWidth }}
      >
        <Topbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <motion.div
          key={isCollapsed ? "collapsed" : "expanded"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 overflow-y-auto p-6 md:p-8 relative custom-scrollbar z-10"
        >
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(#B5A65F 1px, rgba(0, 0, 0, 0) 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B5A65F]/5 blur-[120px] pointer-events-none -z-10" />

          <div className="relative z-10 h-full">
            <Outlet />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
