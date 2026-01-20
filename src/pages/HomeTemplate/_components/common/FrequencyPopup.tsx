import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaHandshake, FaArrowRight } from "react-icons/fa";
import OrganizerRegModal from "./OrganizerRegModal";
import webieBg from "@/assets/images/webie_background.webp";
import OptimizedImage from "@/components/ui/OptimizedImage";

import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { ROLES } from "@/constants";

const FrequencyPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    if (
      isAuthenticated &&
      (user?.role === ROLES.ORGANIZER || user?.role === ROLES.SUPER_ADMIN)
    ) {
      return;
    }

    const currentCount = parseInt(
      localStorage.getItem("page_load_count") || "0",
    );
    const newCount = currentCount + 1;
    localStorage.setItem("page_load_count", newCount.toString());

    if (newCount > 0 && newCount % 10 === 0) {
      setIsVisible(true);
    }
  }, [isAuthenticated, user]);

  const handleOpenModal = () => {
    setIsVisible(false);
    setShowModal(true);
  };

  if (isAuthenticated && user?.role === ROLES.ORGANIZER) return null;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 font-noto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setIsVisible(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
              className="relative w-[95vw] max-w-4xl min-h-[500px] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(216,201,123,0.2)] border border-[#D8C97B]/30 group flex bg-[#050505]"
            >
              <div className="absolute inset-0 z-0">
                <OptimizedImage
                  src={webieBg}
                  alt="Webie Background"
                  width={1200}
                  height={800}
                  priority={false}
                  className="w-full h-full"
                  imgClassName="object-[center_30%] transition-transform duration-1000 group-hover:scale-105 opacity-80"
                />
                <div className="absolute inset-0 bg-linear-to-r from-black via-black/90 via-40% to-transparent/20 z-10" />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent z-10" />
              </div>

              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-6 right-6 z-30 p-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all border border-white/5 backdrop-blur-sm"
              >
                <FaTimes size={18} />
              </button>

              <div className="relative z-20 flex flex-col justify-center px-8 md:px-16 py-12 w-full">
                <div className="max-w-full md:max-w-[60%] flex flex-col items-start text-left space-y-7">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D8C97B]/30 bg-[#D8C97B]/10 backdrop-blur-md"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D8C97B] animate-pulse" />
                    <span className="text-[10px] font-bold text-[#D8C97B] uppercase tracking-[0.25em]">
                      Exclusive Invitation
                    </span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-4xl md:text-6xl font-black text-white leading-snug mb-2">
                      TRỞ THÀNH <br />
                      <span className="inline-block pt-2 pb-2 leading-normal text-transparent bg-clip-text bg-gradient-to-r from-[#D8C97B] via-[#FFF5C2] to-[#D8C97B] drop-shadow-sm">
                        ĐỐI TÁC WEBIE
                      </span>
                    </h2>
                    <p className="text-zinc-200 text-sm md:text-base font-light leading-relaxed max-w-md mt-4 border-l-2 border-[#D8C97B]/30 pl-4">
                      Tham gia vào mạng lưới tổ chức sự kiện chuyên nghiệp và mở
                      khóa hệ sinh thái đặc quyền không giới hạn.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2"
                  >
                    <button
                      onClick={handleOpenModal}
                      className="group relative px-8 py-4 rounded-xl overflow-hidden bg-linear-to-r from-[#D8C97B] to-[#cbb865] text-black font-extrabold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(216,201,123,0.3)] transition-all hover:shadow-[0_0_35px_rgba(216,201,123,0.5)] hover:scale-105 active:scale-95"
                    >
                      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-linear-to-r from-transparent to-white opacity-30 group-hover:animate-shine" />
                      <span className="relative flex items-center justify-center gap-2">
                        <FaHandshake className="text-lg" /> ĐĂNG KÝ NGAY
                      </span>
                    </button>

                    <button
                      onClick={() => setIsVisible(false)}
                      className="group px-6 py-4 rounded-xl border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-sm font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                    >
                      Để sau nhé
                      <FaArrowRight className="text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#D8C97B]" />
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <OrganizerRegModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default FrequencyPopup;
