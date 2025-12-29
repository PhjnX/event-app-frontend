import { useEffect, useState, Suspense, useRef } from "react";
import { BrowserRouter, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ConfigProvider, theme } from "antd";
import viVN from "antd/locale/vi_VN";

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
    console.log("🔍 [AuthHandler] Nhận được token từ URL:", rawToken);

    if (!isJwtToken(rawToken)) {
      console.error(
        "❌ [LỖI TOKEN] Backend trả về Token không phải JWT (AccessToken)."
      );
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);

      toast.error(
        <div>
          <strong>Lỗi Backend!</strong>
          <br />
          Server trả về sai loại Token.
        </div>,
        { autoClose: 8000 }
      );
      return;
    }

    try {
      console.log("✅ [AuthHandler] Token JWT hợp lệ. Đang xử lý...");
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
        console.log("🛑 [AppContent] URL Login -> Dừng init.");
        return;
      }

      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!token || !isJwtToken(token)) {
        if (token) console.warn("⚠️ Token rác -> Xóa.");
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        setIsInitializing(false);
        return;
      }

      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } catch (error) {
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
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: theme.darkAlgorithm, 
        token: {
          colorPrimary: "#D8C97B", 
          colorBgBase: "#000000", 
          colorBgContainer: "#141414", 
          colorTextBase: "#ffffff", 
          borderRadius: 8, 
          fontFamily: "'Inter', sans-serif", 
        },
        components: {
          Card: {
            headerFontSize: 16,
          },
          Table: {
            headerBg: "#1f1f1f", 
            headerColor: "#9CA3AF", 
            rowHoverBg: "#333333", 
          },
          Button: {
            fontWeight: 600, 
          },
        },
      }}
    >
      <Suspense fallback={<LoadingScreen />}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </Suspense>
    </ConfigProvider>
  );
}
