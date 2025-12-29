import React from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import AdminTemplate from "../pages/AdminTemplate";
import AdminProtectedRoute from "./admin-protect-route";

// --- Lazy Loading ---
const DashboardPage = React.lazy(
  () => import("../pages/AdminTemplate/Dashboard")
);
const ManageUsersPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageUsers")
);
const ManagePresentersPage = React.lazy(
  () => import("../pages/AdminTemplate/ManagePresenters")
);
const ManageOrganizersPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageOrganizers")
);
const ManageEventsPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageEvents")
);
const EventDetailPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageEvents/EventDetail")
);
const CreateEventPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageEvents/CreateEventPage")
);
const EditEventPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageEvents/EditEventPage")
);

// --- [NEW] IMPORT TRANG QUẢN LÝ NGƯỜI THAM GIA ---
const ManageRegistrationsPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageEvents/ManageRegistrations")
);

const adminRoutes: RouteObject = {
  path: "admin",
  element: <AdminProtectedRoute />,
  children: [
    {
      path: "",
      element: <AdminTemplate />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <DashboardPage /> },
        { path: "users", element: <ManageUsersPage /> },
        { path: "presenters", element: <ManagePresentersPage /> },
        { path: "organizers", element: <ManageOrganizersPage /> },

        // --- EVENTS ROUTES ---
        { path: "events", element: <ManageEventsPage /> },
        { path: "events/create", element: <CreateEventPage /> },

        // [NEW] ROUTE QUẢN LÝ NGƯỜI THAM GIA (Đặt trước route :slug để tránh xung đột)
        {
          path: "events/:eventId/registrations",
          element: <ManageRegistrationsPage />,
        },

        { path: "events/:slug/edit", element: <EditEventPage /> },
        { path: "events/:slug", element: <EventDetailPage /> },
      ],
    },
  ],
};

export default adminRoutes;
