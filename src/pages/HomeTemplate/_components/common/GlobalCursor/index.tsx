import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function GlobalCursor() {
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Cấu hình độ trễ (Spring)
  const springConfig = { damping: 25, stiffness: 300, mass: 0.2 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Chỉ chạy logic này trên màn hình lớn để tiết kiệm hiệu năng
    if (window.innerWidth < 1024) return;

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isLink =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.closest("a") ||
        target.closest("button") ||
        window.getComputedStyle(target).cursor === "pointer";

      setIsHovering(!!isLink);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* Thêm class 'hidden lg:block' để ẩn hoàn toàn trên mobile/tablet */}
      <motion.div
        className="hidden lg:block fixed top-0 left-0 border border-[#B5A65F] rounded-full pointer-events-none z-9999"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovering ? 50 : 20,
          height: isHovering ? 50 : 20,
          opacity: isHovering ? 1 : 0.5,
          borderWidth: isHovering ? 2 : 1.5,
          backgroundColor: isHovering
            ? "rgba(181, 166, 95, 0.1)"
            : "transparent",
        }}
      />
    </>
  );
}
