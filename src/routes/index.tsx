import React, { Suspense } from "react";
import { useRoutes, Navigate, type RouteObject } from "react-router-dom";
import LoadingScreen from "../pages/HomeTemplate/_components/common/LoadingSrceen";

import userRoutes from "./userRoutes";
import adminRoutes from "./adminRoutes";

const LoginPage = React.lazy(() => import("../pages/AuthPage/LoginPage"));
// Đường dẫn cố định /account/delete được khai trong Google Play Console (yêu
// cầu bắt buộc: người dùng phải xoá được tài khoản từ web, không cần mở app).
// Đổi đường dẫn này là phải khai lại bên Google.
const AccountDeletePage = React.lazy(
  () => import("../pages/HomeTemplate/AccountDeletePage"),
);
// /privacy cũng là đường dẫn cố định khai trong Play Console (ô "Chính sách
// quyền riêng tư"). Để ngoài userRoutes để URL không dính tiền tố ngôn ngữ.
const PrivacyPolicyPage = React.lazy(
  () => import("../pages/HomeTemplate/PrivacyPolicyPage"),
);
// Layout chung của phần người dùng — dùng lại cho /privacy để trang có
// Header và Footer như mọi trang khác.
const HomeTemplate = React.lazy(() => import("../pages/HomeTemplate"));

/**
 * Trước đây ở đây có một useEffect tự nạp lại thông tin người dùng khi mở
 * trang. Nó đọc localStorage bằng khoá "ACCESS_TOKEN" trong khi token thật
 * được lưu dưới khoá "accessToken", nên chưa bao giờ chạy. Việc nạp lại đã
 * được App.tsx làm đầy đủ hơn (kiểm tra token hỏng, xoá token rác, có cờ chờ
 * khởi tạo), nên bỏ hẳn đoạn trùng lặp thay vì sửa khoá — sửa khoá chỉ khiến
 * gọi API lấy thông tin người dùng hai lần mỗi lần tải trang.
 */
const RenderRoutes = () => {
  const authRoutes = {
    path: "/auth",
    element: <LoginPage />,
  };

  const accountDeleteRoute = {
    path: "/account/delete",
    element: <AccountDeletePage />,
  };

  const privacyRoute = {
    path: "/privacy",
    element: <HomeTemplate />,
    children: [{ index: true, element: <PrivacyPolicyPage /> }],
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
    accountDeleteRoute,
    privacyRoute,
    notFoundRoute,
  ]);

  return <Suspense fallback={<LoadingScreen />}>{element}</Suspense>;
};

export default RenderRoutes;
