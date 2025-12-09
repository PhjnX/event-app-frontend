import { useEffect, useState, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RenderRoutes from "./routes";
import type { AppDispatch } from "./store";
import { fetchCurrentUser } from "./store/slices/auth";
import { STORAGE_KEYS } from "./constants";
import ScrollToTop from "./pages/HomeTemplate/_components/common/ScrollToTop";
import LoadingScreen from "./pages/HomeTemplate/_components/common/LoadingSrceen";
import GlobalCursor from "./pages/HomeTemplate/_components/common/GlobalCursor";

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitializing, setIsInitializing] = useState(true);
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          console.log("Phiên đăng nhập đã hết hạn hoặc token không hợp lệ.");
        }
      }
      setIsInitializing(false);
    };

    initAuth();
  }, [dispatch]);

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <>
      <ScrollToTop />
      <RenderRoutes />
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BrowserRouter>
        <GlobalCursor />
        <AppContent />
      </BrowserRouter>
    </Suspense>
  );
}
