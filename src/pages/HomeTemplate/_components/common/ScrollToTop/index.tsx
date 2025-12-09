import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  // 1. Xử lý khi chuyển trang (Route change)
  useEffect(() => {
    // Sử dụng 'instant' để nó nhảy ngay lập tức lên đầu, không trượt từ từ gây chóng mặt
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]); // Chạy mỗi khi pathname thay đổi

  // 2. Xử lý khi Reload (F5)
  useEffect(() => {
    // Tắt tính năng tự động khôi phục vị trí scroll của trình duyệt
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Scroll lên đầu ngay khi component được mount (lần đầu load)
    window.scrollTo(0, 0);

    // (Optional) Cleanup: Bật lại auto khi unmount nếu cần (thường không cần thiết trong SPA)
    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  return null; // Component này không render ra giao diện gì cả
}
