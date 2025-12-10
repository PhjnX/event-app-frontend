import React from "react";
import type { RouteObject } from "react-router-dom";
import AdminTemplate from "../pages/AdminTemplate";
import AdminProtectedRoute from "./admin-protect-route";

// Giả sử bạn có các component page cho admin (nếu chưa có thì tạo tạm file rỗng để test)
const DashboardPage = React.lazy(
  () => import("../pages/AdminTemplate/Dashboard")
);
// Tạo tạm file Dashboard.tsx: export default function Dashboard() { return <div>Nội dung thống kê</div> }
const ManageUsersPage = React.lazy(
  () => import("../pages/AdminTemplate/ManageUsers")
);

const adminRoutes: RouteObject = {
  path: "admin",
  element: <AdminProtectedRoute />, // LỚP BẢO VỆ
  children: [
    {
      path: "",
      element: <AdminTemplate />, // LAYOUT ADMIN
      children: [
        {
          index: true,
          element: <DashboardPage />,
        },
        {
          path: "users", // đường dẫn sẽ là /admin/users
          element: <ManageUsersPage />,
        },
        // Thêm các route khác: events, settings...
      ],
    },
  ],
};

export default adminRoutes;
