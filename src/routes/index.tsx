import React, { Suspense, useEffect } from "react";
import { useRoutes } from "react-router-dom";
import { useDispatch } from "react-redux";
import HomeTemplate from "../pages/HomeTemplate";
import ProtectedRoute from "./protect-routes";
import LoadingScreen from "../pages/HomeTemplate/_components/common/LoadingSrceen";
import adminRoutes from "./adminRoutes"; // Import admin routes vừa tạo
import { fetchCurrentUser } from "../store/slices/auth";
import type { AppDispatch } from "../store";

// Lazy loading User pages
const HomePage = React.lazy(() => import("../pages/HomeTemplate/HomePage"));
const AboutPage = React.lazy(() => import("../pages/HomeTemplate/AboutPage"));
const ValuePage = React.lazy(() => import("../pages/HomeTemplate/ValuePage"));
const ProfilePage = React.lazy(
  () => import("../pages/HomeTemplate/_components/Profile")
);
const LoginPage = React.lazy(() => import("../pages/AuthPage/LoginPage")); // Page Login mới tạo

const RenderRoutes = () => {
  const dispatch = useDispatch<AppDispatch>();

  // GỌI API LẤY THÔNG TIN USER KHI APP RELOAD (quan trọng)
  useEffect(() => {
    const token = localStorage.getItem("ACCESS_TOKEN"); // Đảm bảo key giống bên slice
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  // Cấu trúc route User
  const userRoutes = {
    path: "/",
    element: <HomeTemplate />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "value", element: <ValuePage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "profile", element: <ProfilePage /> }],
      },
    ],
  };

  // Route Login riêng biệt
  const authRoutes = {
    path: "/auth",
    element: <LoginPage />,
  };

  // Cấu trúc Route chung cho xử lý lỗi
  const notFoundRoute = {
    path: "*",
    element: <div className="p-10 text-center">404 - Not Found</div>,
  };

  // Sử dụng useRoutes để render
  const element = useRoutes([
    userRoutes,
    adminRoutes, // Nhúng routes admin vào đây
    authRoutes,
    notFoundRoute,
  ]);

  return <Suspense fallback={<LoadingScreen />}>{element}</Suspense>;
};

export default RenderRoutes;
