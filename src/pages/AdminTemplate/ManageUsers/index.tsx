import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaCrown,
  FaShieldAlt,
  FaUsers,
  FaCamera,
  FaCopy,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaPhone,
  FaEnvelope,
  FaFileExcel,
} from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchUserList,
  deleteUser,
  updateUser,
  fetchMyAttendees,
} from "@/store/slices/userSlice";
import { uploadAvatar } from "../../../store/slices/auth";
import { ROLES } from "@/constants";
import type { User } from "../../../models/user";

const ITEMS_PER_PAGE = 8;

export default function ManageUsers() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: users, isLoading } = useSelector(
    (state: RootState) => state.listUser
  );
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const isOrganizer = currentUser?.role === ROLES.ORGANIZER;
  const isSuperAdmin = currentUser?.role === ROLES.SUPER_ADMIN;

  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    if (isOrganizer) {
      dispatch(fetchMyAttendees());
    } else {
      dispatch(fetchUserList());
    }
  }, [dispatch, isOrganizer]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterRole]);

  const filteredData = useMemo(() => {
    let result = users || [];
    if (!isOrganizer && filterRole !== "ALL") {
      result = result.filter((u) => u.role === filterRole);
    }
    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (u) =>
          (u.username || "").toLowerCase().includes(lower) ||
          (u.email || "").toLowerCase().includes(lower) ||
          (String(u.uid) || "").toLowerCase().includes(lower)
      );
    }
    return result;
  }, [users, searchText, filterRole, isOrganizer]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // --- LOGIC: XUẤT EXCEL ---
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast.warn("Không có dữ liệu để xuất!");
      return;
    }

    const dataToExport = filteredData.map((u) => ({
      ID: u.uid,
      "Họ và tên": u.username,
      Email: u.email,
      "Số điện thoại": u.phoneNumber || "---",
      "Vai trò": u.role,
      "Giới tính":
        u.gender === "MALE" ? "Nam" : u.gender === "FEMALE" ? "Nữ" : "Khác",
      "Địa chỉ": u.address || "---",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [
      { wch: 10 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 30 },
    ];
    worksheet["!cols"] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách người dùng");

    const fileName = `User_List_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success("Xuất file Excel thành công!");
  };

  const handleViewClick = (user: User) => {
    setSelectedUser(user);
    setFormData(user);
    setIsEditing(false);
    setPreviewImage(user.avatarUrl || null);
    setIsDrawerOpen(true);
  };

  const handleEditClick = (user: User) => {
    if (isOrganizer) return;
    setSelectedUser(user);
    setFormData(user);
    setIsEditing(true);
    setPreviewImage(user.avatarUrl || null);
    setFileToUpload(null);
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = async (uid: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      await dispatch(deleteUser(uid)).unwrap();
      toast.success("Đã xóa người dùng.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileToUpload(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      let finalAvatarUrl = selectedUser.avatarUrl;
      if (fileToUpload) {
        finalAvatarUrl = await dispatch(uploadAvatar(fileToUpload)).unwrap();
      }

      const updateData = { ...formData, avatarUrl: finalAvatarUrl };
      await dispatch(
        updateUser({ uid: selectedUser.uid, data: updateData })
      ).unwrap();

      toast.success("Cập nhật thành công!");
      setIsDrawerOpen(false);
      setFileToUpload(null);
    } catch (error) {
      console.error(error);
    }
  };

  const RoleBadge = ({ role }: { role: string }) => {
    const configs: any = {
      [ROLES.SUPER_ADMIN]: {
        color: "text-red-500",
        Icon: FaCrown,
        label: "Admin",
      },
      [ROLES.ORGANIZER]: {
        color: "text-[#FFD700]",
        Icon: FaShieldAlt,
        label: "Organizer",
      },
      DEFAULT: { color: "text-blue-400", Icon: FaUsers, label: "User" },
    };
    const config = configs[role] || configs.DEFAULT;

    return (
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.05)] ${config.color}`}
      >
        <config.Icon className="text-xs" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {config.label}
        </span>
      </div>
    );
  };

  return (
    <div className="pb-20 font-sans text-white min-h-screen selection:bg-[rgba(181,166,95,0.3)]">
      {/* --- TOP BAR CONTROLS --- */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-8 pt-4">
        {isOrganizer ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-[#B5A65F] rounded-full shadow-[0_0_10px_#B5A65F]"></div>
            <h2 className="text-2xl font-bold">Danh sách khách hàng</h2>
          </div>
        ) : (
          <div className="w-full xl:w-auto overflow-x-auto">
            <div className="flex gap-1 p-1 bg-[#1a1a1a] border border-white/10 rounded-full w-max">
              {[
                { id: "ALL", label: "Tất cả" },
                { id: ROLES.SUPER_ADMIN, label: "Admin" },
                { id: ROLES.ORGANIZER, label: "Organizer" },
                { id: "USER", label: "User" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterRole(tab.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                    filterRole === tab.id
                      ? "bg-[#B5A65F] text-black shadow-lg shadow-[rgba(181,166,95,0.2)]"
                      : "text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-[rgba(22,163,74,0.15)] text-green-500 border border-[rgba(22,163,74,0.3)] hover:bg-green-600 hover:text-white transition-all font-bold text-sm shadow-lg"
          >
            <FaFileExcel /> Xuất Excel
          </button>
          <div className="relative group w-full sm:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F]" />
            <input
              type="text"
              placeholder={
                isOrganizer ? "Tìm khách hàng..." : "Tìm thành viên..."
              }
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-full pl-10 pr-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none shadow-sm transition-all focus:ring-1 focus:ring-[#B5A65F]"
            />
          </div>
        </div>
      </div>

      {/* --- USER GRID --- */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-72 bg-[#1a1a1a] rounded-2xl animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {currentData.map((user) => {
              const isSelf = currentUser?.uid === user.uid;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={user.uid}
                  className="group relative bg-[#141414] rounded-2xl border border-white/5 hover:border-[rgba(255,215,0,0.3)] transition-all duration-300 flex flex-col overflow-hidden shadow-lg"
                >
                  <div className="h-20 bg-linear-to-b from-[#252525] to-[#141414] relative">
                    <div className="absolute top-3 right-3">
                      <RoleBadge role={user.role} />
                    </div>
                  </div>

                  <div className="px-5 pb-5 flex flex-col items-center -mt-10 relative z-10">
                    <div
                      className={`relative rounded-xl p-1 ${
                        isSelf
                          ? "bg-linear-to-b from-[#D8C97B] to-[rgba(216,201,123,0)]"
                          : "bg-[#141414]"
                      }`}
                    >
                      <div className="w-[72px] h-[72px] rounded-full bg-[#222] border-4 border-[#141414] overflow-hidden">
                        <img
                          src={
                            user.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${user.username}`
                          }
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="text-center mt-3 w-full">
                      <h3 className="text-white font-bold text-base truncate flex items-center justify-center gap-2">
                        {user.username}{" "}
                        {isSelf && (
                          <span className="text-[9px] text-black bg-[#FFD700] px-1.5 rounded font-bold">
                            ME
                          </span>
                        )}
                      </h3>
                      <div
                        className="inline-flex items-center gap-1 mt-1 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                        onClick={() => {
                          navigator.clipboard.writeText(String(user.uid));
                          toast.info("Đã sao chép ID!");
                        }}
                      >
                        <span className="text-[10px] text-gray-400 font-mono">
                          #{String(user.uid).substring(0, 8)}...
                        </span>
                        <FaCopy className="text-[10px] text-[#FFD700]" />
                      </div>
                    </div>
                    <div className="w-full mt-6 space-y-3 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-600" />
                        <span className="truncate flex-1">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-600" />
                        <span className="truncate flex-1">
                          {user.phoneNumber || "---"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-white/5 py-3 px-4 flex justify-between items-center bg-[rgba(24,24,24,0.5)] opacity-60 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleViewClick(user)}
                      className="p-2 text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-all"
                    >
                      <FaEye />
                    </button>
                    <div className="flex gap-1">
                      {!isOrganizer && (
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-gray-500 hover:text-[#FFD700] hover:bg-[rgba(255,215,0,0.1)] rounded-lg transition-all"
                        >
                          <FaEdit />
                        </button>
                      )}
                      {!isSelf && isSuperAdmin && (
                        <button
                          onClick={() => handleDeleteClick(String(user.uid))}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition-all"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* --- PAGINATION --- */}
      {!isLoading && filteredData.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1a1a1a] text-white disabled:opacity-30 transition-all"
          >
            <FaChevronLeft size={12} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                currentPage === page
                  ? "bg-[#B5A65F] text-black shadow-lg"
                  : "bg-[#1a1a1a] text-gray-400 hover:text-white"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1a1a1a] text-white disabled:opacity-30 transition-all"
          >
            <FaChevronRight size={12} />
          </button>
        </div>
      )}

      {/* --- DRAWER VIEW/EDIT --- */}
      <AnimatePresence>
        {isDrawerOpen && selectedUser && (
          <>
            {/* FIX WARNING: bg-black/80 -> rgba alpha 0.8 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#141414] border-l border-white/10 z-50 shadow-2xl flex flex-col"
            >
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]">
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <FaEdit className="text-[#FFD700]" />
                  ) : (
                    <FaEye className="text-[#FFD700]" />
                  )}
                  <h3 className="text-lg font-bold text-white mb-0">
                    {isEditing ? "Chỉnh sửa hồ sơ" : "Thông tin chi tiết"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)] text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="userForm" onSubmit={handleSave} className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full border-2 border-[#333] shadow-2xl bg-[#1f1f1f] overflow-hidden">
                        <img
                          src={
                            previewImage ||
                            selectedUser.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${selectedUser.username}`
                          }
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {isEditing && !isOrganizer && (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-[rgba(0,0,0,0.6)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          <FaCamera className="text-xl text-white" />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="w-full h-px bg-[rgba(255,255,255,0.05)] my-6" />
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase font-bold text-gray-400 tracking-tighter">
                        Họ và Tên
                      </label>
                      <input
                        type="text"
                        disabled={!isEditing || isOrganizer}
                        value={formData.username || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-[#FFD700] outline-none disabled:opacity-50 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase font-bold text-gray-400 tracking-tighter">
                        Email
                      </label>
                      <input
                        type="text"
                        disabled
                        value={formData.email || ""}
                        className="w-full bg-[rgba(26,26,26,1)] border border-transparent rounded-lg px-4 py-2.5 text-gray-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase font-bold text-gray-400 tracking-tighter">
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          disabled={!isEditing || isOrganizer}
                          value={formData.phoneNumber || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-[#FFD700] outline-none transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase font-bold text-gray-400 tracking-tighter">
                          Giới tính
                        </label>
                        <select
                          disabled={!isEditing || isOrganizer}
                          value={formData.gender || "OTHER"}
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-[#FFD700] outline-none appearance-none cursor-pointer"
                        >
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase font-bold text-gray-400 tracking-tighter">
                        Địa chỉ
                      </label>
                      <textarea
                        rows={3}
                        disabled={!isEditing || isOrganizer}
                        value={formData.address || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-[#FFD700] outline-none resize-none transition-all"
                      />
                    </div>
                  </div>
                </form>
              </div>

              {isEditing && !isOrganizer && (
                <div className="p-6 border-t border-white/5 bg-[#1a1a1a] flex gap-3 shadow-2xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-[rgba(255,255,255,0.05)] transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    form="userForm"
                    className="flex-1 py-3 rounded-xl bg-[#B5A65F] text-black font-bold shadow-lg shadow-[rgba(181,166,95,0.2)]"
                  >
                    Lưu
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
