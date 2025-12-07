import { useEffect, useState, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import RenderRoutes from "./routes";
import type { AppDispatch } from "./store";
import { fetchCurrentUser } from "./store/slices/auth";
import { STORAGE_KEYS } from "./constants";

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();

  // Trạng thái khởi tạo: Chặn render router cho đến khi check xong Token
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (token) {
        try {
          // Nếu có token -> Gọi API lấy thông tin User mới nhất
          // Dùng .unwrap() để bắt lỗi nếu token hết hạn
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          console.log("Phiên đăng nhập đã hết hạn.");
        }
      }

      // Hoàn tất quá trình khởi động -> Cho phép render giao diện
      setIsInitializing(false);
    };

    initAuth();
  }, [dispatch]);

  // --- Màn hình chờ khi đang F5 ---
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-[#B5A65F]">
        <div className="w-12 h-12 border-4 border-[#B5A65F] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="font-semibold tracking-wider animate-pulse">
          INITIALIZING...
        </span>
      </div>
    );
  }

  return (
    <>
      <RenderRoutes />
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div>Loading App...</div>}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Suspense>
  );
}
