import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaChalkboardTeacher,
  FaBuilding,
  FaTimes,
  FaCamera,
} from "react-icons/fa";
import { toast } from "react-toastify";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchPresenters,
  deletePresenter,
  createPresenter,
  updatePresenter,
  searchPresenters,
} from "../../../store/slices/presenterSlice";
import { uploadAvatar } from "../../../store/slices/auth";
import LoadingScreen from "@/pages/HomeTemplate/_components/common/LoadingSrceen";
import type { Presenter } from "../../../models/presenter";

export default function ManagePresenters() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading } = useSelector(
    (state: RootState) => state.presenters
  );

  // --- LOCAL STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedPresenter, setSelectedPresenter] = useState<Presenter | null>(
    null
  );

  // State cho Form
  const [formData, setFormData] = useState<Partial<Presenter>>({
    fullName: "",
    title: "",
    company: "",
    bio: "",
    avatarUrl: "",
  });

  // State xử lý ảnh
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    dispatch(fetchPresenters());
  }, [dispatch]);

  // --- HANDLERS ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) dispatch(searchPresenters(searchTerm));
    else dispatch(fetchPresenters());
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      fullName: "",
      title: "",
      company: "",
      bio: "",
      avatarUrl: "",
    });
    setPreviewImage(null);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (presenter: Presenter) => {
    setModalMode("edit");
    setSelectedPresenter(presenter);
    setFormData(presenter);
    setPreviewImage(presenter.avatarUrl); // Hiện ảnh cũ
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa diễn giả này?")) {
      await dispatch(deletePresenter(id));
    }
  };

  // Xử lý chọn ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Submit Form (Có xử lý Upload ảnh trước)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalAvatarUrl = formData.avatarUrl;

    // 1. Nếu có file mới -> Upload lên server
    if (selectedFile) {
      const uploadAction = await dispatch(uploadAvatar(selectedFile));
      if (uploadAvatar.fulfilled.match(uploadAction)) {
        finalAvatarUrl = uploadAction.payload as string;
      } else {
        toast.error("Lỗi upload ảnh");
        return;
      }
    }

    const payload = { ...formData, avatarUrl: finalAvatarUrl };

    if (modalMode === "create") {
      await dispatch(createPresenter(payload));
    } else {
      if (selectedPresenter) {
        await dispatch(
          updatePresenter({ id: selectedPresenter.presenterId, data: payload })
        );
      }
    }
    setIsModalOpen(false);
  };

  if (isLoading && data.length === 0) return <LoadingScreen />;

  return (
    <div className="space-y-8 font-sans text-white relative">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">
            Quản lý <span className="text-[#B5A65F]">Diễn Giả</span>
          </h1>
          <p className="text-gray-400 text-sm font-light">
            Danh sách chuyên gia và khách mời tham dự sự kiện.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="relative w-full md:w-64 group"
          >
            <input
              type="text"
              placeholder="Tìm tên, công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-[#B5A65F] focus:outline-none transition-all placeholder-gray-600"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F]" />
          </form>

          {/* Add Button */}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#B5A65F] to-[#D8C97B] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(181,166,95,0.4)] transition-transform hover:-translate-y-1"
          >
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* --- TABLE LIST --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {data.map((item) => (
            <motion.div
              key={item.presenterId}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative bg-[#1a1a1a]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:border-[#B5A65F]/50 transition-all duration-300 hover:shadow-2xl overflow-hidden"
            >
              {/* Glow Effect */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#B5A65F]/10 rounded-full blur-2xl group-hover:bg-[#B5A65F]/20 transition-all"></div>

              {/* Avatar & Info */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full p-1 bg-linear-to-tr from-[#B5A65F] to-transparent mb-4">
                  <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                    <img
                      src={item.avatarUrl || "https://via.placeholder.com/150"}
                      alt="Avatar"
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#B5A65F] transition-colors line-clamp-1">
                  {item.fullName}
                </h3>
                <p className="text-xs font-bold text-[#B5A65F] uppercase tracking-widest mb-2 line-clamp-1">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                  <FaBuilding /> <span>{item.company}</span>
                </div>

                <p className="text-gray-500 text-sm line-clamp-3 mb-6 min-h-[60px]">
                  {item.bio || "Chưa có thông tin tiểu sử."}
                </p>
              </div>

              {/* Actions Overlay (Chỉ hiện khi hover) */}
              <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-black/80 backdrop-blur-sm flex justify-center gap-4">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-3 rounded-full bg-[#B5A65F] text-black hover:scale-110 transition-transform shadow-lg"
                  title="Chỉnh sửa"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(item.presenterId)}
                  className="p-3 rounded-full bg-red-600 text-white hover:scale-110 transition-transform shadow-lg"
                  title="Xóa"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {data.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <FaChalkboardTeacher className="text-6xl mb-4" />
          <p>Chưa có diễn giả nào.</p>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#121212] border border-[#B5A65F]/30 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#B5A65F]/5 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white uppercase flex items-center gap-3">
                  {modalMode === "create" ? (
                    <FaPlus className="text-[#B5A65F]" />
                  ) : (
                    <FaEdit className="text-[#B5A65F]" />
                  )}
                  {modalMode === "create"
                    ? "Thêm Diễn Giả Mới"
                    : "Cập Nhật Thông Tin"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-12 gap-8"
              >
                <div className="md:col-span-4 flex flex-col items-center">
                  <div
                    className="relative group w-40 h-40 rounded-full border-2 border-dashed border-gray-600 hover:border-[#B5A65F] transition-colors flex items-center justify-center overflow-hidden bg-[#1a1a1a] cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-500 group-hover:text-[#B5A65F]">
                        <FaCamera className="mx-auto text-2xl mb-2" />
                        <span className="text-xs">Upload Ảnh</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-white uppercase">
                        Thay đổi
                      </span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Định dạng: JPG, PNG (Max 5MB)
                  </p>
                </div>

                <div className="md:col-span-8 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#B5A65F] uppercase tracking-wider">
                      Họ và Tên
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all"
                      placeholder="VD: Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Chức danh
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all"
                        placeholder="VD: CEO, Manager"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Công ty
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all"
                        placeholder="VD: Google, VNG"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Tiểu sử (Bio)
                    </label>
                    <textarea
                      rows={4}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all resize-none"
                      placeholder="Mô tả ngắn về diễn giả..."
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 bg-white/5 text-gray-300 font-bold rounded-xl hover:bg-white/10 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-[#B5A65F] text-black font-bold rounded-xl hover:bg-[#c9b96e] transition-colors shadow-lg shadow-[#B5A65F]/20"
                    >
                      {modalMode === "create" ? "Tạo Diễn Giả" : "Lưu Thay Đổi"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
