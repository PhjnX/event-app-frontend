import { useEffect, useState, Suspense, useRef } from "react";
import { BrowserRouter, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import RenderRoutes from "./routes";
import type { AppDispatch } from "./store";
import { fetchCurrentUser } from "./store/slices/auth";
import { STORAGE_KEYS } from "./constants";

import ScrollToTop from "./pages/HomeTemplate/_components/common/ScrollToTop";
import LoadingScreen from "./pages/HomeTemplate/_components/common/LoadingSrceen";
import GlobalCursor from "./pages/HomeTemplate/_components/common/GlobalCursor";

const isJwtToken = (token: string | null) => {
  if (!token) return false;
  const parts = token.split(".");
  return parts.length === 3;
};

function AuthHandler() {
  const [searchParams] = useSearchParams();
  const processingRef = useRef(false);

  useEffect(() => {
    const rawToken =
      searchParams.get("token") ||
      searchParams.get("accessToken") ||
      searchParams.get("refreshToken");

    if (!rawToken || processingRef.current) return;

    processingRef.current = true;
    // Không in rawToken ra console: token này mở được tài khoản, mà console
    // thì ai mở DevTools hay cài tiện ích mở rộng cũng đọc được.

    if (!isJwtToken(rawToken)) {
      console.error(
        "[Đăng nhập] Backend trả về token không đúng định dạng JWT.",
      );
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);

      toast.error(
        <div>
          <strong>Lỗi Backend!</strong>
          <br />
          Server trả về sai loại Token.
        </div>,
        { autoClose: 8000 },
      );
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, rawToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      toast.success("Đăng nhập thành công! Đang vào hệ thống...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (e) {
      console.error(e);
    }
  }, [searchParams]);

  return <LoadingScreen />;
}

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitializing, setIsInitializing] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const initAuth = async () => {
      if (
        searchParams.get("token") ||
        searchParams.get("accessToken") ||
        searchParams.get("refreshToken")
      ) {
        // Đang đăng nhập bằng token trên URL: để AuthHandler ở trên xử lý,
        // chạy tiếp ở đây sẽ đọc phải token cũ trong localStorage.
        return;
      }

      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!token || !isJwtToken(token)) {
        if (token) console.warn("[Đăng nhập] Token hỏng, đã xoá khỏi máy.");
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        setIsInitializing(false);
        return;
      }

      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } catch (error) {
        console.error(error);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [dispatch, searchParams]);

  if (
    searchParams.get("token") ||
    searchParams.get("accessToken") ||
    searchParams.get("refreshToken")
  ) {
    return (
      <>
        <AuthHandler />
        <ToastContainer theme="colored" />
      </>
    );
  }

  if (isInitializing) return <LoadingScreen />;

  return (
    <>
      <ScrollToTop />
      <GlobalCursor />
      <RenderRoutes />
      {/* <BeeChatbot /> */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        newestOnTop={true}
      />
    </>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Suspense>
  );
}
