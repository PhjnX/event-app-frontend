import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import HomeTemplate from "../pages/HomeTemplate";
import ProtectedRoute from "./protect-routes";

// Lazy loading pages
const HomePage = React.lazy(() => import("../pages/HomeTemplate/HomePage"));
const AboutPage = React.lazy(() => import("../pages/HomeTemplate/AboutPage"));
const ProfilePage = React.lazy(() => import("../pages/HomeTemplate/Profile"));
// const LoginPage = React.lazy(() => import("../pages/Login"));

type TRoute = {
  path?: string;
  element: React.ReactNode;
  children?: TRoute[];
};

const routes: TRoute[] = [
  {
    path: "/",
    element: <HomeTemplate />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "about", element: <AboutPage /> },

      // --- Khu vực cần đăng nhập mới vào được ---
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "profile",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
  // { path: "dang-nhap", element: <LoginPage /> },
];

// Hàm đệ quy render routes lồng nhau
const mapRoutes = (routesData: TRoute[]) => {
  return routesData.map((route, index) => {
    if (route.children) {
      return (
        <Route key={index} path={route.path} element={route.element}>
          {mapRoutes(route.children)}
        </Route>
      );
    }
    return <Route key={index} path={route.path} element={route.element} />;
  });
};

const RenderRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] text-[#B5A65F]">
          Loading Page...
        </div>
      }
    >
      <Routes>{mapRoutes(routes)}</Routes>
    </Suspense>
  );
};

export default RenderRoutes;
