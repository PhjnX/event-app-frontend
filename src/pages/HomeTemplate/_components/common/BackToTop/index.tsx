import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", 
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-[#D8C97B] text-black shadow-lg shadow-[#D8C97B]/40 hover:bg-[#d6c56b] transition-colors group cursor-pointer"
          aria-label="Back to Top"
        >
          <FaArrowUp className="text-xl group-hover:-translate-y-1 transition-transform duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
