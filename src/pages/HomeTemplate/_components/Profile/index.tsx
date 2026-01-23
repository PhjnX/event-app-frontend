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
  FaCheckCircle,
  FaBriefcase,
  FaLock,
} from "react-icons/fa";
import { Link } from "@/utils/i18n-router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next"; // Import hook
import type { RootState, AppDispatch } from "../../../../store";
import { updateUserProfile, uploadAvatar } from "../../../../store/slices/auth";
import { toast } from "react-toastify";
import type { User } from "../../../../models/user";

import OrganizerRegModal from "../common/OrganizerRegModal";
import ChangePasswordModal from "../modals/ChangePasswordModal";

export default function ProfilePage() {
  const { t } = useTranslation(); // Init hook
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);

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
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error(t("profile_page.toast.select_image_error"));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("profile_page.toast.image_size_error"));
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewAvatar(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleTriggerFileInput = () => fileInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let currentAvatarUrl = formData.avatarUrl;

    if (selectedFile) {
      const uploadAction = await dispatch(uploadAvatar(selectedFile));
      if (uploadAvatar.fulfilled.match(uploadAction)) {
        currentAvatarUrl = uploadAction.payload as string;
      } else {
        toast.error(t("profile_page.toast.upload_error"));
        return;
      }
    }

    const updatePayload = { ...formData, avatarUrl: currentAvatarUrl };
    const resultAction = await dispatch(updateUserProfile(updatePayload));

    if (updateUserProfile.fulfilled.match(resultAction)) {
      toast.success(t("profile_page.toast.update_success"));
      setSelectedFile(null);
      setPreviewAvatar(null);
    } else {
      const errorMsg = resultAction.payload as string;
      // Dùng error từ server nếu có, hoặc dùng fallback text
      toast.error(errorMsg || t("profile_page.toast.update_fail"));
    }
  };

  const userInitial = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "U";
  const displayAvatar = previewAvatar || formData.avatarUrl;

  // Helper để lấy text Role từ translation
  const getRoleText = (role?: string) => {
    if (!role) return "MEMBER";
    // map role từ BE (ví dụ ORGANIZER) sang key json
    return t(`profile_page.sidebar.roles.${role}`, role);
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 font-noto relative overflow-hidden selection:bg-[rgba(216,201,123,0.3)]">
      {/* 1. BACKGROUND EFFECTS */}
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
      <div className="absolute inset-0 z-0 bg-linear-to-b from-[#0a0a0a] via-[rgba(10,10,10,0.9)] to-[#0a0a0a]"></div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#D8C97B] transition-colors mb-6 group text-sm font-medium"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          {t("profile_page.nav.back_home")}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* SIDEBAR - LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[rgba(18,18,18,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-3xl overflow-hidden shadow-2xl">
              <div className="h-32 bg-linear-to-r from-[rgba(216,201,123,0.2)] to-[#0a0a0a] relative">
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
                        className="absolute inset-0 bg-[rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer text-white gap-1 backdrop-blur-sm"
                      >
                        <FaCamera className="text-xl" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">
                          {t("profile_page.sidebar.upload_btn")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mt-3 uppercase tracking-tight">
                  {user?.username || t("profile_page.sidebar.unknown_user")}
                </h2>
                <div className="flex justify-center mt-2">
                  <span className="px-3 py-1 bg-[rgba(216,201,123,0.1)] border border-[rgba(216,201,123,0.3)] text-[#D8C97B] text-xs font-bold rounded-full tracking-wider uppercase">
                    {getRoleText(user?.role)}
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3 p-3 bg-[rgba(255,255,255,0.05)] rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <div className="w-8 h-8 rounded-full bg-[rgba(216,201,123,0.2)] flex items-center justify-center text-[#D8C97B]">
                      <FaEnvelope size={14} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-400 uppercase font-bold">
                        {t("profile_page.sidebar.email_label")}
                      </p>
                      <p className="text-sm text-gray-200 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsChangePassModalOpen(true)}
                    className="w-full flex items-center gap-3 p-3 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(216,201,123,0.1)] rounded-xl border border-[rgba(255,255,255,0.05)] hover:border-[rgba(216,201,123,0.3)] transition-all group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[rgba(55,65,81,0.5)] group-hover:bg-[rgba(216,201,123,0.2)] flex items-center justify-center text-gray-400 group-hover:text-[#D8C97B] transition-colors">
                      <FaLock size={14} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-400 uppercase font-bold group-hover:text-[#D8C97B] transition-colors">
                        {t("profile_page.sidebar.security.label")}
                      </p>
                      <p className="text-sm text-gray-200 font-medium">
                        {t("profile_page.sidebar.security.change_password")}
                      </p>
                    </div>
                  </button>
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

            {/* STATUS CARDS */}
            {user?.role !== "ADMIN" && user?.role !== "SADMIN" && (
              <>
                {user?.role === "ORGANIZER" ? (
                  <div className="bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-[rgba(34,197,94,0.2)] rounded-full flex items-center justify-center mx-auto mb-3 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                      <FaCheckCircle size={20} />
                    </div>
                    <h4 className="text-green-500 font-bold mb-1 uppercase text-sm">
                      {t("profile_page.organizer_card.is_organizer.title")}
                    </h4>
                    <p className="text-gray-400 text-xs font-light">
                      {t("profile_page.organizer_card.is_organizer.desc")}
                    </p>
                  </div>
                ) : (
                  <div className="bg-linear-to-r from-[rgba(216,201,123,0.2)] to-[rgba(216,201,123,0.05)] border border-[rgba(216,201,123,0.2)] rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-[rgba(216,201,123,0.2)] rounded-full flex items-center justify-center mx-auto mb-3 text-[#D8C97B]">
                      <FaBriefcase size={20} />
                    </div>
                    <h4 className="text-[#D8C97B] font-bold mb-1 uppercase text-sm">
                      {t("profile_page.organizer_card.become_organizer.title")}
                    </h4>
                    <p className="text-gray-400 text-xs mb-3 font-light">
                      {t("profile_page.organizer_card.become_organizer.desc")}
                    </p>
                    <button
                      onClick={() => setIsRegisterModalOpen(true)}
                      className="text-xs bg-[#D8C97B] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#d6c56b] transition-all transform active:scale-95"
                    >
                      {t("profile_page.organizer_card.become_organizer.btn")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* FORM - RIGHT COLUMN */}
          <div className="lg:col-span-8">
            <div className="bg-[rgba(18,18,18,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-3xl p-8 lg:p-10 shadow-2xl h-full">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[rgba(255,255,255,0.1)]">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 uppercase tracking-tight">
                    {t("profile_page.form.header.title")}
                  </h3>
                  <p className="text-gray-400 text-sm font-light">
                    {t("profile_page.form.header.subtitle")}
                  </p>
                </div>
                <div className="hidden md:block">
                  <FaUser className="text-4xl text-[rgba(255,255,255,0.05)]" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-2 group">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#D8C97B] uppercase ml-1 transition-colors group-focus-within:text-white">
                      <FaUser size={12} />{" "}
                      {t("profile_page.form.fields.fullname")}
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white focus:border-[#D8C97B] focus:ring-1 focus:ring-[#D8C97B] outline-none transition-all"
                    />
                  </div>
                  {/* Email Input - ReadOnly */}
                  <div className="space-y-2 opacity-70">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase ml-1">
                      <FaEnvelope size={12} />{" "}
                      {t("profile_page.form.fields.email_fixed")}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] rounded-xl py-3 px-4 text-gray-500 cursor-not-allowed select-none"
                    />
                  </div>
                  {/* Phone Input */}
                  <div className="space-y-2 group">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#D8C97B] uppercase ml-1 transition-colors group-focus-within:text-white">
                      <FaPhone size={12} />{" "}
                      {t("profile_page.form.fields.phone")}
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber || ""}
                      onChange={handleChange}
                      placeholder={t(
                        "profile_page.form.fields.phone_placeholder",
                      )}
                      className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white focus:border-[#D8C97B] focus:ring-1 focus:ring-[#D8C97B] outline-none transition-all"
                    />
                  </div>
                  {/* DOB Input */}
                  <div className="space-y-2 group">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#D8C97B] uppercase ml-1 transition-colors group-focus-within:text-white">
                      <FaBirthdayCake size={12} />{" "}
                      {t("profile_page.form.fields.dob")}
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ""}
                      onChange={handleChange}
                      className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white focus:border-[#D8C97B] focus:ring-1 focus:ring-[#D8C97B] outline-none transition-all scheme-dark"
                    />
                  </div>
                  {/* Gender Select */}
                  <div className="space-y-2 group">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#D8C97B] uppercase ml-1 transition-colors group-focus-within:text-white">
                      <FaVenusMars size={12} />{" "}
                      {t("profile_page.form.fields.gender")}
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleChange}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white focus:border-[#D8C97B] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="MALE" className="bg-[#121212]">
                          {t("profile_page.form.fields.gender_options.male")}
                        </option>
                        <option value="FEMALE" className="bg-[#121212]">
                          {t("profile_page.form.fields.gender_options.female")}
                        </option>
                        <option value="OTHER" className="bg-[#121212]">
                          {t("profile_page.form.fields.gender_options.other")}
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
                  {/* Address TextArea */}
                  <div className="md:col-span-2 space-y-2 group">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#D8C97B] uppercase ml-1 transition-colors group-focus-within:text-white">
                      <FaMapMarkerAlt size={12} />{" "}
                      {t("profile_page.form.fields.address")}
                    </label>
                    <textarea
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      rows={3}
                      placeholder={t(
                        "profile_page.form.fields.address_placeholder",
                      )}
                      className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white focus:border-[#D8C97B] focus:ring-1 focus:ring-[#D8C97B] outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-[rgba(255,255,255,0.1)] flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-gray-500 italic text-center md:text-left font-light">
                    {t("profile_page.form.footer.note")}
                  </p>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-3.5 bg-[#D8C97B] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(216,201,123,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap uppercase text-sm tracking-widest"
                  >
                    {isLoading ? (
                      t("profile_page.form.footer.btn_saving")
                    ) : (
                      <>
                        <FaSave /> {t("profile_page.form.footer.btn_save")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>

      <OrganizerRegModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
      <ChangePasswordModal
        isOpen={isChangePassModalOpen}
        onClose={() => setIsChangePassModalOpen(false)}
      />
    </div>
  );
}
