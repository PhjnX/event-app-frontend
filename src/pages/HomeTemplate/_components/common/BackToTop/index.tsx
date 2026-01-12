import { useEffect, useState } from "react";
import { FaArrowUp, FaHandshake } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface BackToTopProps {
  onOpenOrgModal?: () => void;
}

const BackToTop = ({ onOpenOrgModal }: BackToTopProps) => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-8 right-6 z-90 flex flex-col items-end gap-4 pointer-events-none">
   
      <div className="md:hidden relative flex items-center pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mr-3 bg-[#18181b] border border-[#D8C97B]/30 text-[#D8C97B] text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap"
        >
          Hợp tác ngay
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#18181b] border-t border-r border-[#D8C97B]/30 rotate-45"></div>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (onOpenOrgModal) onOpenOrgModal();
          }}
          className="w-12 h-12 bg-[#D8C97B] text-black rounded-full shadow-[0_0_20px_rgba(216,201,123,0.4)] flex items-center justify-center border-2 border-white/20 z-[100] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] animate-[shimmer_3s_infinite]" />

          <FaHandshake size={18} />
        </motion.button>
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="pointer-events-auto w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 text-white/50 hover:text-white rounded-full flex items-center justify-center transition-all duration-300"
          >
            <FaArrowUp size={14} />
          </motion.button>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
      `}</style>
    </div>
  );
};

export default BackToTop;
