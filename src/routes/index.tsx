import React, { Suspense, useEffect } from "react";
import { useRoutes, Navigate, type RouteObject } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { fetchCurrentUser } from "../store/slices/auth";
import LoadingScreen from "../pages/HomeTemplate/_components/common/LoadingSrceen";

import userRoutes from "./userRoutes";
import adminRoutes from "./adminRoutes";

const LoginPage = React.lazy(() => import("../pages/AuthPage/LoginPage"));

const RenderRoutes = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  const authRoutes = {
    path: "/auth",
    element: <LoginPage />,
  };

  const notFoundRoute = {
    path: "*",
    element: <div className="p-10 text-center text-white">404 - Not Found</div>,
  };

  const rootRedirect: RouteObject = {
    path: "/",
    element: <Navigate to="/vi" replace />,
  };

  const element = useRoutes([
    rootRedirect,
    adminRoutes,
    userRoutes,
    authRoutes,
    notFoundRoute,
  ]);

  return <Suspense fallback={<LoadingScreen />}>{element}</Suspense>;
};

export default RenderRoutes;
