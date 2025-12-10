import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaVenusMars,
  FaCamera,
  FaSave,
  FaArrowLeft,
  FaImage,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../store";
import { updateUserProfile, uploadAvatar } from "../../../../store/slices/auth"; 
import { toast } from "react-toastify";
import type { User } from "../../../../models/user";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<User>>({
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
    dateOfBirth: "",
    avatarUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        gender: user.gender || "MALE",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh quá lớn! Vui lòng chọn ảnh < 5MB.");
        return;
      }

      setSelectedFile(file);

      const objectUrl = URL.createObjectURL(file);
      setPreviewAvatar(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let currentAvatarUrl = formData.avatarUrl;

    if (selectedFile) {
      const uploadAction = await dispatch(uploadAvatar(selectedFile));

      if (uploadAvatar.fulfilled.match(uploadAction)) {
        const uploadedUrl = uploadAction.payload as string;
        currentAvatarUrl = uploadedUrl;
      } else {
        toast.error("Lỗi khi tải ảnh lên server.");
        return; 
      }
    }

    const updatePayload = {
      ...formData,
      avatarUrl: currentAvatarUrl,
    };

    const resultAction = await dispatch(updateUserProfile(updatePayload));

    if (updateUserProfile.fulfilled.match(resultAction)) {
      toast.success("Cập nhật hồ sơ thành công! 🎉");
      setSelectedFile(null);
      setPreviewAvatar(null);
    } else {
      const errorMsg = resultAction.payload as string;
      toast.error(errorMsg || "Cập nhật thất bại.");
    }
  };

  const userInitial = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "U";

  const displayAvatar = previewAvatar || formData.avatarUrl;

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 font-sans relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(100%)",
        }}
      ></div>
      <div className="absolute inset-0 z-0 bg-linear-to-b from-[#0a0a0a] via-[#0a0a0a]/90 to-[#0a0a0a]"></div>

      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#D8C97B] blur-[180px] opacity-10 rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500 blur-[180px] opacity-10 rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#D8C97B] transition-colors mb-6 group text-sm font-medium"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Quay lại trang chủ
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#121212]/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="h-32 bg-linear-to-r from-[#D8C97B]/20 to-[#0a0a0a] relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
              </div>

              <div className="px-6 pb-8 relative text-center -mt-16">
                <div className="relative inline-block group">
                  <div className="w-32 h-32 rounded-full p-1 bg-linear-to-tr from-[#D8C97B] via-white to-[#D8C97B]">
                    <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative">
                      {displayAvatar ? (
                        <img
                          src={displayAvatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-black text-[#D8C97B]">
                          {userInitial}
                        </span>
                      )}

                      <div
                        onClick={handleTriggerFileInput}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer text-white gap-1 backdrop-blur-sm"
                      >
                        <FaCamera className="text-xl" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">
                          Upload
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Status dot */}
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-[#121212] rounded-full"></div>
                </div>

                <h2 className="text-2xl font-bold text-white mt-3">
                  {user?.username || "Unknown User"}
                </h2>
                <div className="flex justify-center mt-2">
                  <span className="px-3 py-1 bg-[#D8C97B]/10 border border-[#D8C97B]/30 text-[#D8C97B] text-xs font-bold rounded-full tracking-wider uppercase">
                    {user?.role || "MEMBER"}
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-[#D8C97B]/20 flex items-center justify-center text-[#D8C97B]">
                      <FaEnvelope size={14} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-400 uppercase font-bold">
                        Email
                      </p>
                      <p className="text-sm text-gray-200 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-[#D8C97B]/20 flex items-center justify-center text-[#D8C97B]">
                      <FaImage size={14} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-400 uppercase font-bold">
                        Trạng thái ảnh
                      </p>
                      <p className="text-sm text-gray-200 truncate">
                        {selectedFile ? "Đã chọn ảnh mới" : "Ảnh hiện tại"}
                      </p>
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </div>

            <div className="bg-linear-to-r from-[#D8C97B]/20 to-[#D8C97B]/5 border border-[#D8C97B]/20 rounded-2xl p-6 text-center">
              <h4 className="text-[#D8C97B] font-bold mb-1">
                Nâng cấp tài khoản?
              </h4>
              <p className="text-gray-400 text-xs mb-3">
                Mở khóa các tính năng sự kiện nâng cao.
              </p>
              <button className="text-xs bg-[#D8C97B] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#d6c56b] transition-colors">
                Tìm hiểu thêm
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-[#121212]/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl h-full">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Cài Đặt Hồ Sơ
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Quản lý thông tin cá nhân và bảo mật
                  </p>
                </div>
                <div className="hidden md:block">
                  <FaUser className="text-4xl text-white/5" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#D8C97B] uppercase tracking-wider group-focus-within:text-white transition-colors">
                      <FaUser /> Họ và Tên
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:border-[#D8C97B] focus:bg-black/60 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2 opacity-70">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <FaEnvelope /> Email (Read-only)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-gray-500 cursor-not-allowed select-none"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#D8C97B] uppercase tracking-wider group-focus-within:text-white transition-colors">
                      <FaPhone /> Số điện thoại
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber || ""}
                      onChange={handleChange}
                      placeholder="09xx..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:border-[#D8C97B] focus:bg-black/60 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#D8C97B] uppercase tracking-wider group-focus-within:text-white transition-colors">
                      <FaBirthdayCake /> Ngày sinh
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ""}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#D8C97B] focus:bg-black/60 focus:outline-none transition-all scheme-dark"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#D8C97B] uppercase tracking-wider group-focus-within:text-white transition-colors">
                      <FaVenusMars /> Giới tính
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#D8C97B] focus:bg-black/60 focus:outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="MALE" className="bg-[#121212]">
                          Nam
                        </option>
                        <option value="FEMALE" className="bg-[#121212]">
                          Nữ
                        </option>
                        <option value="OTHER" className="bg-[#121212]">
                          Khác
                        </option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg
                          width="10"
                          height="6"
                          viewBox="0 0 10 6"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 1L5 5L9 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2 group">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#D8C97B] uppercase tracking-wider group-focus-within:text-white transition-colors">
                      <FaMapMarkerAlt /> Địa chỉ
                    </label>
                    <textarea
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Nhập địa chỉ..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:border-[#D8C97B] focus:bg-black/60 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-gray-500 italic text-center md:text-left">
                    * Các thay đổi sẽ được cập nhật ngay sau khi lưu.
                  </p>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-linear-to-r from-[#D8C97B] to-[#D8C97B] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(181,166,95,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Đang xử lý...
                      </span>
                    ) : (
                      <>
                        <FaSave /> Lưu Thay Đổi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
