import { useEffect, useState } from "react";
import { FaArrowUp, FaHandshake, FaPhone } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface BackToTopProps {
  onOpenOrgModal?: () => void;
}

const fabClass =
  "w-10 h-10 bg-black/40 backdrop-blur-md border border-[#D8C97B]/40 text-[#D8C97B] hover:bg-[#D8C97B]/20 hover:border-[#D8C97B] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer";

const Tooltip = ({ label }: { label: string }) => (
  <motion.div
    initial={{ opacity: 0, x: 6 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 6 }}
    transition={{ duration: 0.15 }}
    className="absolute right-12 whitespace-nowrap bg-[#18181b] border border-[#D8C97B]/30 text-[#D8C97B] text-[11px] font-semibold tracking-wide px-3 py-1.5 rounded-lg pointer-events-none select-none"
  >
    {label}
    <span className="absolute -right-1.25 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#18181b] border-t border-r border-[#D8C97B]/30 rotate-45" />
  </motion.div>
);

const FabButton = ({
  tooltip,
  onClick,
  href,
  children,
  className,
}: {
  tooltip: string;
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
  className: string;
}) => {
  const [hovered, setHovered] = useState(false);

  const inner = (
    <>
      <AnimatePresence>
        {hovered && <Tooltip label={tooltip} />}
      </AnimatePresence>
      {children}
    </>
  );

  const shared = {
    className: `relative ${className}`,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  if (href)
    return (
      <a href={href} {...shared}>
        {inner}
      </a>
    );
  return (
    <button onClick={onClick} {...shared}>
      {inner}
    </button>
  );
};

const BackToTop = ({ onOpenOrgModal }: BackToTopProps) => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="fixed bottom-34 right-6 z-50"
      >
        <FabButton
          tooltip="Gọi cho chúng tôi"
          href="tel:0969838467"
          className={fabClass}
        >
          <FaPhone size={14} />
        </FabButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="fixed bottom-22 right-6 z-50"
      >
        <FabButton
          tooltip="Liên hệ hợp tác"
          onClick={() => onOpenOrgModal?.()}
          className={fabClass}
        >
          <FaHandshake size={15} />
        </FabButton>
      </motion.div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-8 right-6 z-50"
          >
            <FabButton
              tooltip="Về đầu trang"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={fabClass}
            >
              <FaArrowUp size={14} />
            </FabButton>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BackToTop;
