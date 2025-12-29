import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "DELETE" | "APPROVE" | "WARNING"; 
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "WARNING",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
}: Props) {
  const config = {
    DELETE: {
      colorClass: "bg-red-500 text-red-500 border-red-500/30",
      btnClass: "bg-red-500 hover:bg-red-400",
      Icon: FaTrashAlt,
    },
    APPROVE: {
      colorClass: "bg-green-500 text-green-500 border-green-500/30",
      btnClass: "bg-green-500 hover:bg-green-400",
      Icon: FaCheck,
    },
    WARNING: {
      colorClass: "bg-yellow-500 text-yellow-500 border-yellow-500/30",
      btnClass: "bg-yellow-500 hover:bg-yellow-400",
      Icon: FaExclamationTriangle,
    },
  }[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className={`relative w-full max-w-sm rounded-3xl p-8 shadow-2xl border bg-[#121212] ${
              config.colorClass.split(" ")[2]
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-opacity-10 ${
                config.colorClass.split(" ")[0]
              } ${config.colorClass.split(" ")[1]}`}
            >
              <config.Icon size={24} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 text-center">
              {title}
            </h3>
            <p className="text-gray-400 text-sm mb-6 text-center">{message}</p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-400 font-bold text-sm hover:bg-white/10 hover:text-white transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm text-black transition-transform hover:-translate-y-0.5 active:scale-95 ${config.btnClass}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
