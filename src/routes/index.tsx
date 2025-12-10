import React, { Suspense, useEffect } from "react";
import { useRoutes } from "react-router-dom";
import { useDispatch } from "react-redux";
import HomeTemplate from "../pages/HomeTemplate";
import ProtectedRoute from "./protect-routes";
import LoadingScreen from "../pages/HomeTemplate/_components/common/LoadingSrceen";
import adminRoutes from "./adminRoutes"; 
import { fetchCurrentUser } from "../store/slices/auth";
import type { AppDispatch } from "../store";

const HomePage = React.lazy(() => import("../pages/HomeTemplate/HomePage"));
const AboutPage = React.lazy(() => import("../pages/HomeTemplate/AboutPage"));
const ValuePage = React.lazy(() => import("../pages/HomeTemplate/ValuePage"));
const ProfilePage = React.lazy(
  () => import("../pages/HomeTemplate/_components/Profile")
);
const LoginPage = React.lazy(() => import("../pages/AuthPage/LoginPage")); 

const RenderRoutes = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = localStorage.getItem("ACCESS_TOKEN"); 
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

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

  const authRoutes = {
    path: "/auth",
    element: <LoginPage />,
  };

  const notFoundRoute = {
    path: "*",
    element: <div className="p-10 text-center">404 - Not Found</div>,
  };

  const element = useRoutes([
    userRoutes,
    adminRoutes, 
    authRoutes,
    notFoundRoute,
  ]);

  return <Suspense fallback={<LoadingScreen />}>{element}</Suspense>;
};

export default RenderRoutes;
