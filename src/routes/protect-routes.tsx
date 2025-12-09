import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Nếu chưa đăng nhập -> Chuyển hướng về trang Login
  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace />;
  }

  // Đã đăng nhập -> Cho phép truy cập
  return <Outlet />;
};
export default ProtectedRoute;
