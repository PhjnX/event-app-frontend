import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaTrashAlt,
  FaEye,
  FaUserShield,
  FaUser,
  FaTimes,
  FaCrown,
  FaCopy,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { toast } from "react-toastify"; // Nhớ import toast nếu chưa có
import type { AppDispatch, RootState } from "../../../store";
import {
  fetchUserList,
  deleteUser,
  searchUser,
  fetchUserDetail,
  clearUserDetail,
} from "@/store/slices/userSlice";
import LoadingScreen from "@/pages/HomeTemplate/_components/common/LoadingSrceen";
import { ROLES } from "@/constants";

// Helper: Rút gọn ID
const truncateId = (id: string) => {
  if (!id) return "";
  return id.substring(0, 8) + "...";
};

// Helper: Copy to clipboard
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Đã sao chép ID!");
};

export default function ManageUsers() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, userDetail } = useSelector(
    (state: RootState) => state.listUser
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUserList());
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      dispatch(searchUser(searchTerm));
    } else {
      dispatch(fetchUserList());
    }
  };

  const handleViewDetail = async (uid: string) => {
    await dispatch(fetchUserDetail(uid));
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    dispatch(clearUserDetail());
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await dispatch(deleteUser(userToDelete));
      setUserToDelete(null);
    }
  };

  if (isLoading && data.length === 0) return <LoadingScreen />;

  return (
    <div className="space-y-8 font-sans text-white relative">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">
            Danh sách <span className="text-[#D8C97B]">Thành viên</span>
          </h1>
          <p className="text-gray-400 text-sm font-light max-w-md">
            Quản lý, phân quyền và theo dõi trạng thái hoạt động của toàn bộ
            người dùng trong hệ thống.
          </p>
        </div>

        {/* Search Box - Modern Style */}
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-lg bg-[#D8C97B]/10 border border-[#D8C97B]/20 text-[#D8C97B] font-bold text-xs uppercase tracking-wider">
            Total: {data.length}
          </div>

          <form
            onSubmit={handleSearch}
            className="relative w-full md:w-80 group"
          >
            <input
              type="text"
              placeholder="Tìm user bằng email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-[#D8C97B] focus:ring-1 focus:ring-[#D8C97B] focus:outline-none transition-all placeholder-gray-600"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
          </form>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121212]/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#D8C97B]/10">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-[#D8C97B] uppercase tracking-widest text-left">
                  Thông tin User
                </th>
                <th className="px-6 py-5 text-xs font-bold text-[#D8C97B] uppercase tracking-widest text-left">
                  Vai trò (Role)
                </th>
                <th className="px-6 py-5 text-xs font-bold text-[#D8C97B] uppercase tracking-widest text-left">
                  Liên hệ
                </th>
                <th className="px-6 py-5 text-xs font-bold text-[#D8C97B] uppercase tracking-widest text-center">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {data.map((user) => (
                <tr
                  key={user.uid}
                  className="group hover:bg-white/2 transition-colors duration-200"
                >
                  {/* Cột 1: User Info */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full p-0.5 bg-linear-to-tr from-[#D8C97B] to-transparent">
                          <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                className="w-full h-full object-cover"
                                alt="avt"
                              />
                            ) : (
                              <span className="text-[#D8C97B] font-bold text-lg">
                                {user.username?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Status Dot */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#121212] rounded-full"></div>
                      </div>

                      {/* Name & ID */}
                      <div>
                        <p className="font-bold text-white text-base group-hover:text-[#D8C97B] transition-colors">
                          {user.username}
                        </p>
                        <div
                          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 cursor-pointer transition-colors mt-0.5"
                          onClick={() => copyToClipboard(user.uid)}
                          title="Click để copy ID"
                        >
                          <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-[10px]">
                            #{truncateId(user.uid)}
                          </span>
                          <FaCopy className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]" />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Role (Badge phát sáng) */}
                  <td className="px-6 py-5">
                    <div
                      className={`
                        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider shadow-lg
                        ${
                          user.role === ROLES.SUPER_ADMIN
                            ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-red-900/20"
                            : user.role === ROLES.ORGANIZER
                            ? "bg-[#D8C97B]/10 border-[#D8C97B]/30 text-[#D8C97B] shadow-[#D8C97B]/20"
                            : "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-900/20"
                        }
                     `}
                    >
                      {user.role === ROLES.SUPER_ADMIN && (
                        <FaCrown className="text-sm mb-0.5" />
                      )}
                      {user.role === ROLES.ORGANIZER && (
                        <FaUserShield className="text-sm mb-0.5" />
                      )}
                      {(!user.role || user.role === "User") && (
                        <FaUser className="text-sm mb-0.5" />
                      )}
                      <span>{user.role || "Member"}</span>
                    </div>
                  </td>

                  {/* Cột 3: Contact */}
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <FaEnvelope className="text-gray-600 text-xs" />
                        <span className="truncate max-w-[150px]">
                          {user.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaPhoneAlt className="text-gray-600 text-[10px]" />
                        <span>{user.phoneNumber || "---"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Cột 4: Actions */}
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleViewDetail(user.uid)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 hover:text-white hover:scale-110 transition-all text-gray-400"
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>

                      <button
                        onClick={() => setUserToDelete(user.uid)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/10 hover:bg-red-500 hover:text-white hover:scale-110 transition-all text-red-500 border border-red-500/20"
                        title="Xóa người dùng"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {data.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <FaUserShield className="text-6xl mb-4 text-gray-500" />
                      <p className="text-lg font-bold">
                        Không tìm thấy kết quả nào
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {isDetailModalOpen && userDetail && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetailModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#121212] border border-[#D8C97B]/30 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D8C97B]/10 rounded-full blur-[50px] pointer-events-none"></div>

              <button
                onClick={closeDetailModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <FaTimes size={20} />
              </button>

              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full p-[3px] bg-linear-to-br from-[#D8C97B] to-transparent mb-4">
                  <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                    {userDetail.avatarUrl ? (
                      <img
                        src={userDetail.avatarUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-[#D8C97B]">
                        {userDetail.username?.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {userDetail.username}
                </h2>
                <span className="text-[#D8C97B] text-xs font-bold uppercase tracking-widest mt-1 px-3 py-1 bg-[#D8C97B]/10 rounded-full border border-[#D8C97B]/20">
                  {userDetail.role}
                </span>
                <p className="text-xs text-gray-500 mt-2 font-mono bg-white/5 px-2 py-1 rounded">
                  UID: {userDetail.uid}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/3 rounded-2xl border border-white/5">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Email
                  </p>
                  <p
                    className="text-sm text-gray-200 truncate"
                    title={userDetail.email}
                  >
                    {userDetail.email}
                  </p>
                </div>
                <div className="p-4 bg-white/3 rounded-2xl border border-white/5">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Điện thoại
                  </p>
                  <p className="text-sm text-gray-200">
                    {userDetail.phoneNumber || "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-white/3 rounded-2xl border border-white/5">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Giới tính
                  </p>
                  <p className="text-sm text-gray-200">
                    {userDetail.gender || "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-white/3 rounded-2xl border border-white/5">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Địa chỉ
                  </p>
                  <p className="text-sm text-gray-200 truncate">
                    {userDetail.address || "N/A"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL CONFIRM DELETE --- */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserToDelete(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#1a1a1a] border border-red-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.2)] max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                <FaTrashAlt size={30} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Xóa người dùng?
              </h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Hành động này{" "}
                <span className="text-red-400 font-bold">
                  không thể hoàn tác
                </span>
                . Dữ liệu của người dùng sẽ bị xóa vĩnh viễn khỏi hệ thống.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmDelete}
                  className="w-full py-3.5 rounded-xl bg-linear-to-r from-red-600 to-red-800 text-white font-bold hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all transform hover:scale-[1.02]"
                >
                  Xác nhận Xóa
                </button>
                <button
                  onClick={() => setUserToDelete(null)}
                  className="w-full py-3.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors font-bold"
                >
                  Hủy bỏ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
