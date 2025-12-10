import { Outlet, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { forceLogout } from "../../store/slices/auth";

export default function AdminTemplate() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(forceLogout());
    navigate("/auth");
  };

  // Logic phân quyền UI
  const isSuperAdmin = user?.role === "SuperAdmin";
  // const isOrganizer = user?.role === "Organizer"; // Có thể dùng nếu cần

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-wider">EMS ADMIN</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {/* Mọi Role admin đều thấy */}
          <Link
            to="/admin"
            className="flex items-center px-4 py-3 rounded-md hover:bg-slate-800 transition-colors"
          >
            <span className="ml-3">Dashboard (Thống kê)</span>
          </Link>

          <Link
            to="/admin/events"
            className="flex items-center px-4 py-3 rounded-md hover:bg-slate-800 transition-colors"
          >
            <span className="ml-3">Quản lý Sự kiện</span>
          </Link>

          {/* --- CHỈ SUPER ADMIN MỚI THẤY --- */}
          {isSuperAdmin && (
            <>
              <div className="px-4 py-2 mt-4 text-xs font-semibold text-slate-500 uppercase">
                Super Admin Only
              </div>

              <Link
                to="/admin/users"
                className="flex items-center px-4 py-3 rounded-md bg-indigo-900/50 hover:bg-indigo-900 text-indigo-100"
              >
                <span className="ml-3">Quản lý Người dùng</span>
              </Link>

              <Link
                to="/admin/settings"
                className="flex items-center px-4 py-3 rounded-md hover:bg-slate-800 transition-colors"
              >
                <span className="ml-3">Cấu hình hệ thống</span>
              </Link>
            </>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-xs">
              AVT
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.username || "Admin"}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <h2 className="text-lg font-semibold text-gray-700">
            Xin chào, {user?.role}
          </h2>
          {/* Nút Back to Home User */}
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            Về trang chủ User
          </Link>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
