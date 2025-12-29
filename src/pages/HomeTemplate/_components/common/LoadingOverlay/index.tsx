import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

const LoadingOverlay = ({
  message = "Đang xử lý...",
  className = "",
}: LoadingOverlayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-inherit ${className}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <FaSpinner className="text-4xl text-[#B5A65F]" />
      </motion.div>

      <span className="mt-3 text-sm font-bold text-white tracking-wider animate-pulse">
        {message}
      </span>
    </motion.div>
  );
};

export default LoadingOverlay;
