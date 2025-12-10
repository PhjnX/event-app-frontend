import React from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import AdminTemplate from "../pages/AdminTemplate"; // Import file index.tsx vừa sửa
import AdminProtectedRoute from "./admin-protect-route";

// --- IMPORT CÁC PAGE CON (Lazy load) ---
// Đảm bảo bạn đã tạo file Dashboard/index.tsx thật hoặc dùng tạm file rỗng để test
const DashboardPage = React.lazy(
  () => import("../pages/AdminTemplate/Dashboard")
);
const ManageUsersPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageUsers")
);
// const ManageEventsPage = React.lazy(() => import("../pages/AdminTemplate/ManageEvents"));

const adminRoutes: RouteObject = {
  path: "admin",
  element: <AdminProtectedRoute />, // Bảo vệ toàn bộ cụm Admin
  children: [
    {
      path: "",
      element: <AdminTemplate />, // Layout mới: Sidebar + Topbar + Outlet
      children: [
        // Redirect mặc định vào dashboard
        { index: true, element: <Navigate to="dashboard" replace /> },

        {
          path: "dashboard",
          element: <DashboardPage />,
        },
        {
          path: "users",
          element: <ManageUsersPage />,
        },
        // Thêm các route khác tương ứng với menu
        // { path: "events", element: <ManageEventsPage /> },
      ],
    },
  ],
};

export default adminRoutes;
