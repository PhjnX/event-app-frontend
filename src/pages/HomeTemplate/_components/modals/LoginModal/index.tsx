import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../../../../store";
import { loginUser, clearError } from "../../../../../store/slices/auth";
import { modalVariants } from "@/constants/motions";

import GoogleLogo from "@/assets/images/google-color.svg";
import LogoApp from "@/assets/images/Logo_EMS.webp";
import { useTranslation } from "react-i18next";

const GOOGLE_LOGIN_URL =
  "https://event-app-y77p.onrender.com/oauth2/authorization/google";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToForgot,
}: LoginModalProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const { isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isOpen) onClose();
  }, [isAuthenticated, isOpen, onClose]);

  useEffect(() => {
    if (isOpen) dispatch(clearError());
  }, [isOpen, dispatch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.warning(t("auth_modals.validation.required_all"));
      return;
    }

    const resultAction = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(resultAction)) {
      toast.success(t("auth_modals.login.success_msg"));
    } else {
      const rawMsg = (resultAction.payload as string) || "";

      if (
        rawMsg.includes("Bad credentials") ||
        rawMsg.includes("Lỗi hệ thống") ||
        rawMsg.includes("User not found")
      ) {
        toast.error(t("auth_modals.validation.bad_credentials"));
      } else {
        toast.error(rawMsg || t("auth_modals.validation.login_failed"));
      }
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
            className="relative w-full max-w-md bg-[#1a1a1a] border border-[rgba(216,201,123,0.3)] rounded-2xl shadow-[0_0_50px_-12px_rgba(181,166,95,0.25)] overflow-hidden z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 z-10 cursor-pointer transition-colors"
            >
              <FaTimes size={20} />
            </button>

            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[rgba(216,201,123,0)] via-[#D8C97B] to-[rgba(216,201,123,0)]"></div>

            <div className="p-8 pt-10">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <img
                    src={LogoApp}
                    alt="Logo"
                    className="w-10 h-10 object-contain filter drop-shadow-[0_0_8px_rgba(216,201,123,0.4)]"
                  />
                  <h2 className="text-3xl font-bold text-white uppercase tracking-tight">
                    {t("auth_modals.login.title")}
                  </h2>
                </div>
                <p className="text-gray-400 text-sm font-light">
                  {t("auth_modals.login.subtitle")}
                </p>
              </div>

              {error && !error.includes("Bad credentials") && (
                <div className="mb-4 p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.5)] rounded-lg text-red-400 text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#D8C97B] uppercase tracking-wider ml-1">
                    {t("auth_modals.common.email")}
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

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-[#D8C97B] uppercase tracking-wider">
                      {t("auth_modals.common.password")}
                    </label>
                    <button
                      type="button"
                      onClick={onSwitchToForgot}
                      className="text-xs text-gray-500 hover:text-[#D8C97B] transition-colors hover:underline cursor-pointer font-medium"
                    >
                      {t("auth_modals.login.forgot_password")}
                    </button>
                  </div>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D8C97B] transition-colors" />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t(
                        "auth_modals.common.placeholders.password",
                      )}
                      className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3.5 pl-12 pr-12 text-white focus:border-[#D8C97B] focus:outline-none transition-all focus:ring-1 focus:ring-[#D8C97B]"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D8C97B] cursor-pointer transition-colors p-1"
                    >
                      {showPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#D8C97B] hover:bg-[#c4b56f] text-black font-bold py-3.5 rounded-xl transition-all hover:-translate-y-1 shadow-lg cursor-pointer flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed uppercase text-sm tracking-widest"
                >
                  {isLoading ? (
                    <span className="inline-block w-5 h-5 border-2 border-black border-t-[rgba(0,0,0,0)] rounded-full animate-spin mr-2"></span>
                  ) : null}
                  {isLoading
                    ? t("auth_modals.common.processing")
                    : t("auth_modals.login.btn_submit")}
                </button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="h-px bg-[rgba(255,255,255,0.1)] flex-1"></div>
                <span className="text-gray-500 text-xs uppercase font-bold tracking-tighter">
                  {t("auth_modals.common.or")}
                </span>
                <div className="h-px bg-[rgba(255,255,255,0.1)] flex-1"></div>
              </div>

              <a
                href={GOOGLE_LOGIN_URL}
                className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all hover:-translate-y-1 cursor-pointer no-underline shadow-md text-sm uppercase tracking-wide"
              >
                <img
                  src={GoogleLogo}
                  alt="Google"
                  className="w-5 h-5 object-contain"
                />
                <span>{t("auth_modals.login.google_login")}</span>
              </a>

              <p className="text-center text-gray-500 text-sm mt-8 font-light">
                {t("auth_modals.login.no_account")}{" "}
                <button
                  onClick={onSwitchToRegister}
                  className="text-[#D8C97B] font-bold hover:underline cursor-pointer"
                >
                  {t("auth_modals.login.register_now")}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
