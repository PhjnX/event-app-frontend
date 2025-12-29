import { useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import LoadingScreen from "@/pages/HomeTemplate/_components/common/LoadingSrceen";
import ConfirmModal from "@/pages/AdminTemplate/_components/ConfirmModal";
import { ROLES } from "@/constants";

const AdminProtectedRoute = () => {
  const { isAuthenticated, user, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();
  const navigate = useNavigate();

  const [isForbidden, setIsForbidden] = useState(true);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (user && user.role === "USER") {
    const handleClose = () => {
      navigate("/", { replace: true });
    };

    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <ConfirmModal
          isOpen={isForbidden}
          onClose={() => setIsForbidden(false)}
          onConfirm={handleClose}
          type="DELETE"
          title="Không đủ quyền truy cập"
          message="Tài khoản của bạn không có quyền truy cập vào trang Quản trị. Vui lòng quay lại trang chủ."
          confirmText="Về trang chủ"
        />
      </div>
    );
  }

  if (
    user &&
    (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ORGANIZER)
  ) {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};

export default AdminProtectedRoute;
