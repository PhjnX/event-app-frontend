import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaEnvelope,
  FaArrowLeft,
  FaKey,
  FaLock,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { modalVariants } from "@/constants/motions";
import LogoApp from "@/assets/images/Logo_EMS.webp";
import apiService from "../../../../../services/apiService";
import { useTranslation } from "react-i18next";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: ForgotPasswordModalProps) {
  const { t } = useTranslation();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.warning(t("auth_modals.validation.required_email"));
      return;
    }

    setIsLoading(true);
    try {
      await apiService.post("/users/forgot-password", { email: cleanEmail });
      toast.success(t("auth_modals.forgot_password.success_sent"));
      setStep(2);
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Email không tồn tại trong hệ thống.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();

    if (!cleanOtp || !newPassword || !confirmPassword) {
      toast.warning(t("auth_modals.validation.required_all"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("auth_modals.validation.password_mismatch"));
      return;
    }

    setIsLoading(true);
    try {
      await apiService.post("/users/reset-password", {
        email: cleanEmail,
        otp: cleanOtp,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });

      toast.success(t("auth_modals.forgot_password.success_reset"));
      onClose();
      onSwitchToLogin();
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Quá trình đổi mật khẩu thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-noto selection:bg-[rgba(216,201,123,0.3)]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-[#1a1a1a] border border-[rgba(216,201,123,0.3)] rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 z-10 transition-colors"
            >
              <FaTimes size={20} />
            </button>

            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[rgba(216,201,123,0)] via-[#D8C97B] to-[rgba(216,201,123,0)]"></div>

            <div className="p-8 pt-10 text-center">
              <div className="flex flex-col items-center mb-6">
                <img
                  src={LogoApp}
                  alt="Logo"
                  className="w-12 h-12 object-contain mb-4 filter drop-shadow-[0_0_8px_rgba(216,201,123,0.4)]"
                />
                <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">
                  {step === 1
                    ? t("auth_modals.forgot_password.title_step1")
                    : t("auth_modals.forgot_password.title_step2")}
                </h2>
                <p className="text-gray-400 text-sm px-4 font-light">
                  {step === 1
                    ? t("auth_modals.forgot_password.subtitle_step1")
                    : t("auth_modals.forgot_password.subtitle_step2")}
                </p>
              </div>

              {step === 1 ? (
                <form className="space-y-6" onSubmit={handleSendOTP}>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1 tracking-wider">
                      {t("auth_modals.forgot_password.label_reg_email")}
                    </label>
                    <div className="relative group">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("auth_modals.common.placeholders.email")}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none transition-all focus:ring-1 focus:ring-[#D8C97B]"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#D8C97B] hover:bg-[#c4b56f] text-black font-bold py-3.5 rounded-xl transition-all hover:-translate-y-1 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed uppercase text-sm tracking-widest"
                  >
                    {isLoading
                      ? t("auth_modals.forgot_password.btn_sending")
                      : t("auth_modals.forgot_password.btn_send")}
                  </button>
                </form>
              ) : (
                <form className="space-y-5" onSubmit={handleResetPassword}>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1 tracking-wider">
                      {t("auth_modals.common.otp")}
                    </label>
                    <div className="relative group">
                      <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder={t("auth_modals.common.placeholders.otp")}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none transition-all focus:ring-1 focus:ring-[#D8C97B]"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1 tracking-wider">
                      {t("auth_modals.forgot_password.label_new_pass")}
                    </label>
                    <div className="relative group">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t(
                          "auth_modals.common.placeholders.password",
                        )}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none transition-all focus:ring-1 focus:ring-[#D8C97B]"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase ml-1 tracking-wider">
                      {t("auth_modals.common.confirm_password")}
                    </label>
                    <div className="relative group">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t(
                          "auth_modals.common.placeholders.password",
                        )}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-[#D8C97B] focus:outline-none transition-all focus:ring-1 focus:ring-[#D8C97B]"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#D8C97B] hover:bg-[#c4b56f] text-black font-bold py-3.5 rounded-xl transition-all hover:-translate-y-1 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed uppercase text-sm tracking-widest"
                  >
                    {isLoading
                      ? t("auth_modals.common.processing")
                      : t("auth_modals.forgot_password.btn_reset")}
                  </button>
                </form>
              )}

              <button
                onClick={step === 1 ? onSwitchToLogin : () => setStep(1)}
                className="mt-8 flex items-center justify-center gap-2 text-gray-400 hover:text-[#D8C97B] text-sm transition-all cursor-pointer mx-auto hover:underline font-medium"
              >
                <FaArrowLeft size={12} />
                {step === 1
                  ? t("auth_modals.forgot_password.back_login")
                  : t("auth_modals.forgot_password.back_step1")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
