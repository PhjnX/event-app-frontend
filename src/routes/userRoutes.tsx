import React from "react";
import { Navigate, type RouteObject, useParams } from "react-router-dom";
import LanguageLayout from "../layouts/LanguageLayout";
import ProtectedRoute from "./protect-routes";
import { DEFAULT_LANG } from "@/utils/i18n-router"; // Import hằng số

const HomeTemplate = React.lazy(() => import("../pages/HomeTemplate"));
const NewsPage = React.lazy(() => import("../pages/HomeTemplate/NewsPage"));
const EventPage = React.lazy(() => import("../pages/HomeTemplate/EventPage"));
const ValuePage = React.lazy(() => import("../pages/HomeTemplate/ValuePage"));
const HomePage = React.lazy(() => import("../pages/HomeTemplate/HomePage"));
const AboutPage = React.lazy(() => import("../pages/HomeTemplate/AboutPage"));
const ProfilePage = React.lazy(
  () => import("../pages/HomeTemplate/_components/Profile"),
);
const PublicEventDetail = React.lazy(
  () => import("../pages/HomeTemplate/EventPage/PublicEventDetail"),
);
const MyRegistrationsPage = React.lazy(
  () => import("../pages/HomeTemplate/EventPage/MyRegistrationsPage"),
);
const EventMomentsPage = React.lazy(
  () => import("../pages/HomeTemplate/EventPage/EventMomentsPage"),
);
const NewsDetail = React.lazy(
  () => import("../pages/HomeTemplate/NewsPage/NewsDetail"),
);

const HomeRedirect = () => {
  const { lang } = useParams();
  if (lang === DEFAULT_LANG) return <Navigate to="/" replace />;
  return <HomePage />;
};

const userRoutes: RouteObject = {
  children: [
    {
      path: "/",
      element: <LanguageLayout />,
      children: [
        {
          element: <HomeTemplate />,
          children: [{ index: true, element: <HomePage /> }],
        },
      ],
    },

    {
      path: "/:lang",
      element: <LanguageLayout />,
      children: [
        {
          path: "",
          element: <HomeTemplate />,
          children: [
            { index: true, element: <HomeRedirect /> },

            { path: "about", element: <AboutPage /> },
            { path: "value", element: <ValuePage /> },
            { path: "events", element: <EventPage /> },
            { path: "news", element: <NewsPage /> },

            // THÊM ROUTE MỚI CÓ CATEGORY SLUG Ở ĐÂY
            { path: "news/:categorySlug/:slug", element: <NewsDetail /> },
            // GIỮ LẠI ROUTE CŨ LÀM FALLBACK (Tránh lỗi 404 cho các link cũ)
            { path: "news/:slug", element: <NewsDetail /> },

            { path: "event/:slug", element: <PublicEventDetail /> },

            {
              element: <ProtectedRoute />,
              children: [
                { path: "profile", element: <ProfilePage /> },
                { path: "my-tickets", element: <MyRegistrationsPage /> },
                {
                  path: "event/:eventSlug/moments",
                  element: <EventMomentsPage />,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default userRoutes;
