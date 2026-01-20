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
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaPhone,
  FaEnvelope,
  FaFileExcel,
  FaFilter,
  FaChevronDown,
  FaCheck,
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
import {
  fetchMyEvents,
  fetchEventRegistrations,
  clearRegistrations,
} from "@/store/slices/eventSlice";
import { uploadAvatar } from "../../../store/slices/auth";
import { ROLES } from "@/constants";
import type { User } from "../../../models/user";

const ITEMS_PER_PAGE = 8;

export default function ManageUsers() {
  const dispatch = useDispatch<AppDispatch>();

  // 1. Nguồn dữ liệu
  const { data: allAttendees, isLoading: isUserLoading } = useSelector(
    (state: RootState) => state.listUser,
  );

  const {
    registrations: eventAttendees,
    isLoading: isRegistrationLoading,
    data: myEvents,
  } = useSelector((state: RootState) => state.events);

  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const isOrganizer = currentUser?.role === ROLES.ORGANIZER;
  const isSuperAdmin = currentUser?.role === ROLES.SUPER_ADMIN;

  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  // State quản lý dropdown custom
  const [filterEventId, setFilterEventId] = useState<string | "ALL">("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  // --- 1. INIT DATA ---
  useEffect(() => {
    if (isOrganizer) {
      dispatch(fetchMyAttendees());
      dispatch(fetchMyEvents());
    } else {
      dispatch(fetchUserList());
    }
  }, [dispatch, isOrganizer]);

  // --- 2. FETCH DATA THEO EVENT ---
  useEffect(() => {
    if (isOrganizer && filterEventId !== "ALL") {
      dispatch(fetchEventRegistrations(Number(filterEventId)));
    } else if (isOrganizer && filterEventId === "ALL") {
      dispatch(clearRegistrations());
    }
    setCurrentPage(1);
  }, [filterEventId, isOrganizer, dispatch]);

  // --- 3. CLICK OUTSIDE DROPDOWN ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 4. DATA PROCESSING ---
  const displayData = useMemo(() => {
    if (isOrganizer && filterEventId !== "ALL") {
      return eventAttendees.map(
        (reg: any) =>
          ({
            uid: reg.userId,
            username: reg.username,
            email: reg.email,
            phoneNumber: reg.phoneNumber,
            avatarUrl: reg.avatarUrl,
            role: "USER",
            address: "",
            gender: "OTHER",
          }) as User,
      );
    }
    return (allAttendees || []) as User[];
  }, [filterEventId, eventAttendees, allAttendees, isOrganizer]);

  const filteredData = useMemo(() => {
    let result = [...displayData]; // Clone mảng để tránh mutate state gốc

    // Lọc theo Role
    if (!isOrganizer && filterRole !== "ALL") {
      result = result.filter((u) => u.role === filterRole);
    }

    // Tìm kiếm
    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (u) =>
          (u.username || "").toLowerCase().includes(lower) ||
          (u.email || "").toLowerCase().includes(lower) ||
          (String(u.uid) || "").toLowerCase().includes(lower) ||
          (u.phoneNumber || "").includes(lower),
      );
    }
    return result;
  }, [displayData, searchText, filterRole, isOrganizer]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // --- 5. HANDLERS ---
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast.warn("Không có dữ liệu để xuất!");
      return;
    }
    const dataToExport = filteredData.map((u: any) => ({
      ID: u.uid,
      "Họ và tên": u.username,
      Email: u.email,
      "Số điện thoại": u.phoneNumber || "---",
      "Vai trò": u.role,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(
      workbook,
      `Users_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    toast.success("Xuất file thành công!");
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
        updateUser({ uid: selectedUser.uid, data: updateData }),
      ).unwrap();
      toast.success("Cập nhật thành công!");
      setIsDrawerOpen(false);
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
        className={`flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-white/5 ${config.color}`}
      >
        <config.Icon className="text-xs" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {config.label}
        </span>
      </div>
    );
  };

  const isLoading =
    isUserLoading || (filterEventId !== "ALL" && isRegistrationLoading);

  return (
    <div className="pb-20 font-noto text-white min-h-screen selection:bg-[#B5A65F]/30 pr-1">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8 pt-4">
        {isOrganizer ? (
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-[#B5A65F] rounded-full shadow-[0_0_10px_#B5A65F]"></div>
              <h2 className="text-2xl font-bold">Danh sách khách hàng</h2>
            </div>

            {/* CUSTOM DROPDOWN (ĐẸP HƠN) */}
            <div className="relative z-30" ref={dropdownRef}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="cursor-pointer flex items-center justify-between gap-4 w-full md:min-w-[320px] px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 hover:border-[#B5A65F]/50 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FaFilter className="text-[#B5A65F] shrink-0" />
                  <span className="text-sm font-bold truncate text-gray-200">
                    {filterEventId === "ALL"
                      ? "Tất cả sự kiện"
                      : myEvents?.find(
                          (e) => String(e.eventId) === filterEventId,
                        )?.eventName || "Chọn sự kiện"}
                  </span>
                </div>
                <FaChevronDown
                  className={`text-gray-500 transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                  >
                    <div
                      onClick={() => {
                        setFilterEventId("ALL");
                        setIsDropdownOpen(false);
                      }}
                      className="px-4 py-3 hover:bg-white/5 cursor-pointer flex justify-between items-center text-sm border-b border-white/5 transition-colors"
                    >
                      <span
                        className={
                          filterEventId === "ALL"
                            ? "text-[#B5A65F] font-bold"
                            : "text-gray-400"
                        }
                      >
                        Tất cả sự kiện
                      </span>
                      {filterEventId === "ALL" && (
                        <FaCheck className="text-[#B5A65F] text-xs" />
                      )}
                    </div>
                    {myEvents?.map((evt) => (
                      <div
                        key={evt.eventId}
                        onClick={() => {
                          setFilterEventId(String(evt.eventId));
                          setIsDropdownOpen(false);
                        }}
                        className="px-4 py-3 hover:bg-white/5 cursor-pointer flex justify-between items-center text-sm border-b border-white/5 last:border-0 transition-colors"
                      >
                        <span
                          className={`truncate mr-2 ${
                            filterEventId === String(evt.eventId)
                              ? "text-[#B5A65F] font-bold"
                              : "text-gray-300"
                          }`}
                        >
                          {evt.eventName}
                        </span>
                        {filterEventId === String(evt.eventId) && (
                          <FaCheck className="text-[#B5A65F] text-xs shrink-0" />
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="w-full xl:w-auto overflow-x-auto custom-scrollbar">
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
                      ? "bg-[#B5A65F] text-black shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <button
            onClick={handleExportExcel}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-900/20 text-green-500 border border-green-500/20 hover:bg-green-600 hover:text-white transition-all font-bold text-sm shadow-lg whitespace-nowrap"
          >
            <FaFileExcel /> Xuất Excel
          </button>
          <div className="relative group w-full sm:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F]" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* CONTENT */}
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
        <>
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-[#141414] rounded-2xl border border-dashed border-white/10">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="text-gray-600 text-3xl" />
              </div>
              <p className="text-gray-300 font-bold text-lg">
                Không tìm thấy dữ liệu
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {filterEventId !== "ALL"
                  ? "Sự kiện này chưa có ai đăng ký"
                  : "Chưa có khách hàng nào"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {currentData.map((user: User) => {
                  const isSelf = currentUser?.uid === user.uid;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={user.uid || Math.random()}
                      className="group relative bg-[#141414] rounded-2xl border border-white/5 hover:border-[#B5A65F]/30 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-[#B5A65F]/10"
                    >
                      <div className="h-20 bg-gradient-to-b from-[#252525] to-[#141414] relative">
                        <div className="absolute top-3 right-3">
                          <RoleBadge role={user.role || "USER"} />
                        </div>
                      </div>
                      <div className="px-5 pb-5 flex flex-col items-center -mt-10 relative z-10">
                        <div
                          className={`relative rounded-xl p-1 ${
                            isSelf
                              ? "bg-gradient-to-b from-[#D8C97B] to-transparent"
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
                          <h3
                            className="text-white font-bold text-base truncate px-2"
                            title={user.username}
                          >
                            {user.username}
                          </h3>
                          <div className="text-[10px] text-gray-500 font-mono mt-1">
                            ID: #{String(user.uid).substring(0, 8)}
                          </div>
                        </div>
                        <div className="w-full mt-6 space-y-3 text-xs text-gray-400 border-t border-white/5 pt-4">
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="text-gray-600 shrink-0" />{" "}
                            <span
                              className="truncate flex-1"
                              title={user.email}
                            >
                              {user.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaPhone className="text-gray-600 shrink-0" />{" "}
                            <span className="truncate flex-1">
                              {user.phoneNumber || "---"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto bg-[#1a1a1a] p-3 flex justify-between items-center border-t border-white/5">
                        <button
                          onClick={() => handleViewClick(user)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                          <FaEye />
                        </button>
                        <div className="flex gap-1">
                          {!isOrganizer && (
                            <button
                              onClick={() => handleEditClick(user)}
                              className="p-2 text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10 rounded-lg"
                            >
                              <FaEdit />
                            </button>
                          )}
                          {isSuperAdmin && !isSelf && (
                            <button
                              onClick={() =>
                                handleDeleteClick(String(user.uid))
                              }
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
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
        </>
      )}

      {/* PAGINATION */}
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

      {/* DRAWER (DETAILS) */}
      <AnimatePresence>
        {isDrawerOpen && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
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
                  <FaEye className="text-[#FFD700]" />{" "}
                  <h3 className="text-lg font-bold text-white">
                    Thông tin chi tiết
                  </h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="userForm" onSubmit={handleSave} className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-2 border-[#333] bg-[#1f1f1f] overflow-hidden">
                      <img
                        src={
                          previewImage ||
                          selectedUser.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${selectedUser.username}`
                        }
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isEditing && !isOrganizer && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 text-xs text-[#B5A65F] cursor-pointer hover:underline flex items-center gap-1"
                      >
                        <FaCamera /> Thay đổi ảnh
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase font-bold text-gray-500">
                        Họ và Tên
                      </label>
                      <input
                        type="text"
                        disabled={!isEditing || isOrganizer}
                        value={formData.username || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#B5A65F] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase font-bold text-gray-500">
                        Email
                      </label>
                      <input
                        type="text"
                        disabled
                        value={formData.email || ""}
                        className="w-full bg-[#1a1a1a] border border-transparent rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase font-bold text-gray-500">
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
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#B5A65F] outline-none"
                      />
                    </div>
                  </div>
                </form>
              </div>
              {isEditing && !isOrganizer && (
                <div className="p-6 border-t border-white/5 bg-[#1a1a1a] flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    form="userForm"
                    className="flex-1 py-3 rounded-xl bg-[#B5A65F] text-black font-bold"
                  >
                    Lưu thay đổi
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
