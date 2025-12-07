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
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { updateUserProfile, type User } from "../../../store/slices/auth";
import { toast } from "react-toastify"; // Import Toast

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // State form
  const [formData, setFormData] = useState<Partial<User>>({
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
    dateOfBirth: "",
    avatarUrl: "",
  });

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
      setPreviewAvatar(null);
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

  // Helper: Convert File -> Base64 String
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Xử lý chọn ảnh
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate dung lượng: Giới hạn 50KB để tránh lỗi Data Too Long (Tùy chỉnh nếu Backend hỗ trợ lớn hơn)
      if (file.size > 50 * 1024) {
        toast.error("Ảnh quá lớn! Vui lòng chọn ảnh dung lượng thấp (< 50KB).");
        return;
      }

      setPreviewAvatar(URL.createObjectURL(file));

      try {
        const base64String = await convertToBase64(file);
        setFormData((prev) => ({ ...prev, avatarUrl: base64String }));
      } catch (err) {
        console.error("Lỗi đọc file ảnh", err);
        toast.error("Không thể xử lý ảnh này.");
      }
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Gọi API
    const resultAction = await dispatch(updateUserProfile(formData));

    if (updateUserProfile.fulfilled.match(resultAction)) {
      toast.success("Cập nhật thông tin thành công! 🎉");
    } else {
      const errorMsg = resultAction.payload as string;
      // Kiểm tra lỗi cụ thể
      if (errorMsg && errorMsg.includes("Data Too Long")) {
        toast.error("Không thể lưu ảnh do dung lượng quá lớn.");
      } else {
        toast.error(errorMsg || "Cập nhật thất bại.");
      }
    }
  };

  const userInitial = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "U";
  const displayAvatar = previewAvatar || user?.avatarUrl;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-20 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(181, 166, 95, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(181, 166, 95, 0.05) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      ></div>
      <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-[#B5A65F]/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#B5A65F] transition-colors mb-8 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Quay lại trang chủ
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* --- LEFT: CARD AVATAR --- */}
          <div className="lg:col-span-4">
            <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative sticky top-28">
              <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#B5A65F]/10 to-transparent"></div>

              {/* AVATAR */}
              <div className="relative group mb-6 z-10">
                <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-[#B5A65F] via-[#FBF5B7] to-[#B5A65F] shadow-lg shadow-[#B5A65F]/20">
                  <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl font-black text-[#B5A65F]">
                        {userInitial}
                      </span>
                    )}

                    {/* Hover Overlay */}
                    <div
                      onClick={handleTriggerFileInput}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs gap-1"
                    >
                      <FaCamera className="text-2xl" />
                      <span>Đổi ảnh</span>
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

              <h2 className="text-2xl font-bold text-white mb-1">
                {user?.username}
              </h2>
              <p className="text-[#B5A65F] text-xs font-bold tracking-widest uppercase mb-6 border border-[#B5A65F]/30 px-3 py-1 rounded-full">
                {user?.role || "MEMBER"}
              </p>

              <div className="w-full bg-white/5 rounded-xl p-4 space-y-3 border border-white/5">
                <div className="flex items-center gap-3 text-gray-300 text-sm">
                  <FaEnvelope className="text-[#B5A65F]" />
                  <span className="truncate flex-1 text-left">
                    {user?.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 text-sm">
                  <FaPhone className="text-[#B5A65F]" />
                  <span className="truncate flex-1 text-left">
                    {formData.phoneNumber || "---"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT: FORM --- */}
          <div className="lg:col-span-8">
            <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 lg:p-10 shadow-2xl">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
                <span className="w-1.5 h-8 bg-[#B5A65F] rounded-full"></span>
                Thông Tin Cá Nhân
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#B5A65F] uppercase ml-1">
                      Họ và Tên
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                      Email (Cố định)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#B5A65F] uppercase ml-1">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber || ""}
                      onChange={handleChange}
                      placeholder="09xx..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#B5A65F] uppercase ml-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ""}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all [color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#B5A65F] uppercase ml-1">
                      Giới tính
                    </label>
                    <select
                      name="gender"
                      value={formData.gender || ""}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all appearance-none cursor-pointer"
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
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-[#B5A65F] uppercase ml-1">
                      Địa chỉ
                    </label>
                    <textarea
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Nhập địa chỉ..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#B5A65F] focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-3 bg-[#B5A65F] text-black font-bold rounded-xl hover:bg-[#d6c56b] transition-all shadow-lg transform hover:-translate-y-1 disabled:opacity-50"
                  >
                    {isLoading ? (
                      "Đang lưu..."
                    ) : (
                      <>
                        {" "}
                        <FaSave /> Lưu Thay Đổi{" "}
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
