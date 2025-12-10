import React from "react";
import type { RouteObject } from "react-router-dom";
import HomeTemplate from "../pages/HomeTemplate";
import ProtectedRoute from "./protect-routes";

const HomePage = React.lazy(() => import("../pages/HomeTemplate/HomePage"));
const AboutPage = React.lazy(() => import("../pages/HomeTemplate/AboutPage"));
const ProfilePage = React.lazy(
  () => import("../pages/HomeTemplate/_components/Profile")
);

const userRoutes: RouteObject = {
  path: "/",
  element: <HomeTemplate />,
  children: [
    { path: "", element: <HomePage /> },
    { path: "about", element: <AboutPage /> },
    {
      element: <ProtectedRoute />, 
      children: [{ path: "profile", element: <ProfilePage /> }],
    },
  ],
};

export default userRoutes;
