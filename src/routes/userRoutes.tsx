import React from "react";
import type { RouteObject } from "react-router-dom";
import HomeTemplate from "../pages/HomeTemplate";
import ProtectedRoute from "./protect-routes";
const NewsPage = React.lazy(() => import("../pages/HomeTemplate/NewsPage"));
const EventPage = React.lazy(() => import("../pages/HomeTemplate/EventPage"));
const ValuePage = React.lazy(() => import("../pages/HomeTemplate/ValuePage"));
const HomePage = React.lazy(() => import("../pages/HomeTemplate/HomePage"));
const AboutPage = React.lazy(() => import("../pages/HomeTemplate/AboutPage"));
const ProfilePage = React.lazy(
  () => import("../pages/HomeTemplate/_components/Profile")
);
const PublicEventDetail = React.lazy(
  () => import("../pages/HomeTemplate/EventPage/PublicEventDetail")
);

const userRoutes: RouteObject = {
  path: "/",
  element: <HomeTemplate />,
  children: [
    { path: "", element: <HomePage /> },
    { path: "about", element: <AboutPage /> },
    { path: "value", element: <ValuePage /> },
    { path: "events", element: <EventPage /> },
    { path: "news", element: <NewsPage /> },

    {
      path: "event/:slug",
      element: <PublicEventDetail />,
    },
    {
      element: <ProtectedRoute />,
      children: [{ path: "profile", element: <ProfilePage /> }],
    },
  ],
};

export default userRoutes;
