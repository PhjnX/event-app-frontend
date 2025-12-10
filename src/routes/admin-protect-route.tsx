import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import LoadingScreen from "@/pages/HomeTemplate/_components/common/LoadingSrceen";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
