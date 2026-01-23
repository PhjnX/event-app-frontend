import React from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
const AdminTemplate = React.lazy(() => import("../pages/AdminTemplate"));
import AdminProtectedRoute from "./admin-protect-route";

const DashboardPage = React.lazy(
  () => import("../pages/AdminTemplate/Dashboard"),
);
const ManageUsersPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageUsers"),
);
const ManagePresentersPage = React.lazy(
  () => import("../pages/AdminTemplate/ManagePresenters"),
);
const ManageOrganizersPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageOrganizers"),
);
const ManageEventsPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageEvents"),
);
const EventDetailPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageEvents/EventDetail"),
);
const CreateEventPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageEvents/CreateEventPage"),
);
const EditEventPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageEvents/EditEventPage"),
);

const ManageRegistrationsPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageEvents/ManageRegistrations"),
);
const ManageNewsPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageNews"),
);
const CreateNewsPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageNews/CreateNews"),
);
const EditNewsPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageNews/EditNews"),
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

        { path: "events", element: <ManageEventsPage /> },
        { path: "events/create", element: <CreateEventPage /> },

        {
          path: "events/:eventId/registrations",
          element: <ManageRegistrationsPage />,
        },

        { path: "events/:slug/edit", element: <EditEventPage /> },
        { path: "events/:slug", element: <EventDetailPage /> },
        { path: "news", element: <ManageNewsPage /> },
        { path: "news/create", element: <CreateNewsPage /> },
        { path: "news/:id/edit", element: <EditNewsPage /> },
      ],
    },
  ],
};

export default adminRoutes;
