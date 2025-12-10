import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

const AdminProtectedRoute = () => {
  const { isAuthenticated, user, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();

  // Đang load (ví dụ đang fetchMe) thì hiện loading
  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading Admin...
      </div>
    );

  // 1. Chưa đăng nhập
  if (!isAuthenticated) {
    // Chuyển hướng về trang login (/auth), state mang theo địa chỉ hiện tại để login xong quay lại
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 2. Đã đăng nhập nhưng chưa có info User (trường hợp hiếm, nhưng nên check)
  if (!user) {
    // Có thể return loading hoặc navigate về login
    return <Navigate to="/auth" replace />;
  }

  // 3. Check Role: Chỉ SuperAdmin và Organizer được vào
  // ...
  // Check Role: Sửa SuperAdmin -> SADMIN
  if (user.role !== "SADMIN" && user.role !== "ORGANIZER") {
    // Nếu role không khớp, đá về trang chủ
    return <Navigate to="/" replace />;
  }

  return <Outlet />;

  // Thỏa mãn tất cả điều kiện
  return <Outlet />;
};

export default AdminProtectedRoute;
