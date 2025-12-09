import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import HomeTemplate from "../pages/HomeTemplate";
import ProtectedRoute from "./protect-routes";
import LoadingScreen from "../pages/HomeTemplate/_components/common/LoadingSrceen";
// Lazy loading pages
const HomePage = React.lazy(() => import("../pages/HomeTemplate/HomePage"));
const AboutPage = React.lazy(() => import("../pages/HomeTemplate/AboutPage"));
const ValuePage = React.lazy(() => import("../pages/HomeTemplate/ValuePage"));
const ProfilePage = React.lazy(
  () => import("../pages/HomeTemplate/_components/Profile")
);
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
      { path: "value", element: <ValuePage /> },

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
    <Suspense fallback={<LoadingScreen />}>
      <Routes>{mapRoutes(routes)}</Routes>
    </Suspense>
  );
};

export default RenderRoutes;
