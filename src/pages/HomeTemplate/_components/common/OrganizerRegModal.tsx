import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  FaTimes,
  FaPaperPlane,
  FaCheckCircle,
  FaSpinner,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaFacebookF,
  FaLinkedinIn,
  FaGlobe,
} from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { registerOrganizer } from "@/store/slices/organizerSlice";
import { toast } from "react-toastify";

import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";
import { useTranslation, Trans } from "react-i18next";

interface OrganizerRegModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrganizerRegModal: React.FC<OrganizerRegModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    orgName: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [authModalType, setAuthModalType] = useState<
    "NONE" | "LOGIN" | "REGISTER"
  >("NONE");

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.username || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
      }));

      setAuthModalType("NONE");
    }
  }, [isAuthenticated, user, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          orgName: "",
          message: "",
        });
        setAuthModalType("NONE");
      }, 600);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info(t("organizer_reg_modal.messages.login_required"), {
        theme: "dark",
      });
      setAuthModalType("LOGIN");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.orgName,
        representative: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        description: formData.message,
      };

      await dispatch(registerOrganizer(payload)).unwrap();
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Lỗi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.5, ease: "easeInOut", delay: 0.2 },
    },
  };

  const modalVariants: Variants = {
    hidden: {
      y: "100%",
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      y: "0%",
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.1,
      },
    },
    exit: {
      y: "100%",
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.4, duration: 0.5 },
    },
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center font-noto overflow-hidden">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full h-full bg-[#050505] text-white flex flex-col lg:flex-row shadow-2xl"
            >
              <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.07]"
                style={{
                  backgroundImage:
                    "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#D8C97B] rounded-full blur-[200px] opacity-[0.05] pointer-events-none -translate-x-1/3 -translate-y-1/3 z-0" />
              <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#D8C97B] rounded-full blur-[200px] opacity-[0.05] pointer-events-none translate-x-1/3 translate-y-1/3 z-0" />

              <motion.button
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0, transition: { delay: 0.6 } }}
                whileHover={{ rotate: 90 }}
                onClick={onClose}
                className="absolute top-8 right-8 z-50 w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-[#D8C97B] text-zinc-400 hover:text-black rounded-full border border-white/10 transition-all duration-300"
              >
                <FaTimes size={20} />
              </motion.button>

              <div className="w-full lg:w-[60%] h-full flex flex-col relative z-10 border-r border-white/10 bg-transparent">
                <div className="lg:hidden px-6 py-4 border-b border-white/10">
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase"
                  >
                    <FaArrowLeft /> {t("organizer_reg_modal.back")}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-16 lg:px-24 py-12 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {!isSuccess ? (
                      <motion.div
                        key="form"
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{
                          opacity: 0,
                          y: -20,
                          transition: { duration: 0.3 },
                        }}
                        className="max-w-2xl w-full mx-auto"
                      >
                        <div className="mb-10">
                          <h2 className="text-4xl md:text-5xl font-noto font-medium text-white mb-4 leading-none tracking-tight">
                            {t("organizer_reg_modal.form.title_prefix")}{" "}
                            <span className="text-[#D8C97B]">
                              {t("organizer_reg_modal.form.title_highlight")}
                            </span>
                          </h2>
                          <p className="text-zinc-500 text-lg font-light max-w-lg">
                            {t("organizer_reg_modal.form.desc")}
                          </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2 group">
                              <label className="text-[10px] font-bold text-[#D8C97B] uppercase tracking-[0.2em] opacity-80 group-focus-within:opacity-100">
                                {t("organizer_reg_modal.form.labels.name")}
                              </label>
                              <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={t(
                                  "organizer_reg_modal.form.placeholders.name",
                                )}
                                className="w-full bg-transparent border-b border-zinc-800 py-3 text-white focus:outline-none focus:border-[#D8C97B] transition-all placeholder:text-zinc-700 text-lg rounded-none"
                              />
                            </div>
                            <div className="space-y-2 group">
                              <label className="text-[10px] font-bold text-[#D8C97B] uppercase tracking-[0.2em] opacity-80 group-focus-within:opacity-100">
                                {t("organizer_reg_modal.form.labels.phone")}
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder={t(
                                  "organizer_reg_modal.form.placeholders.phone",
                                )}
                                className="w-full bg-transparent border-b border-zinc-800 py-3 text-white focus:outline-none focus:border-[#D8C97B] transition-all placeholder:text-zinc-700 text-lg rounded-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2 group">
                              <label className="text-[10px] font-bold text-[#D8C97B] uppercase tracking-[0.2em] opacity-80 group-focus-within:opacity-100">
                                {t("organizer_reg_modal.form.labels.email")}
                              </label>
                              <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t(
                                  "organizer_reg_modal.form.placeholders.email",
                                )}
                                className="w-full bg-transparent border-b border-zinc-800 py-3 text-white focus:outline-none focus:border-[#D8C97B] transition-all placeholder:text-zinc-700 text-lg rounded-none"
                              />
                            </div>
                            <div className="space-y-2 group">
                              <label className="text-[10px] font-bold text-[#D8C97B] uppercase tracking-[0.2em] opacity-80 group-focus-within:opacity-100">
                                {t("organizer_reg_modal.form.labels.org_name")}
                              </label>
                              <input
                                type="text"
                                name="orgName"
                                value={formData.orgName}
                                onChange={handleChange}
                                placeholder={t(
                                  "organizer_reg_modal.form.placeholders.org_name",
                                )}
                                className="w-full bg-transparent border-b border-zinc-800 py-3 text-white focus:outline-none focus:border-[#D8C97B] transition-all placeholder:text-zinc-700 text-lg rounded-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-[#D8C97B] uppercase tracking-[0.2em] opacity-80 group-focus-within:opacity-100">
                              {t("organizer_reg_modal.form.labels.message")}
                            </label>
                            <textarea
                              name="message"
                              rows={2}
                              value={formData.message}
                              onChange={handleChange}
                              placeholder={t(
                                "organizer_reg_modal.form.placeholders.message",
                              )}
                              className="w-full bg-transparent border-b border-zinc-800 py-3 text-white focus:outline-none focus:border-[#D8C97B] transition-all placeholder:text-zinc-700 text-lg rounded-none resize-none"
                            />
                          </div>

                          <div className="pt-8">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full py-4 bg-[#D8C97B] hover:bg-[#c9b96e] text-black font-extrabold uppercase tracking-widest rounded-sm transition-all shadow-[0_0_20px_rgba(216,201,123,0.2)] hover:shadow-[0_0_40px_rgba(216,201,123,0.4)] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {isSubmitting ? (
                                <FaSpinner className="animate-spin text-lg" />
                              ) : (
                                <>
                                  <FaPaperPlane />{" "}
                                  {t("organizer_reg_modal.form.submit_btn")}
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-full text-center"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.2,
                          }}
                          className="mb-8 text-[#D8C97B]"
                        >
                          <FaCheckCircle className="text-8xl drop-shadow-[0_0_30px_rgba(216,201,123,0.4)]" />
                        </motion.div>
                        <h3 className="text-5xl font-serif text-white mb-4">
                          {t("organizer_reg_modal.success.title")}
                        </h3>
                        <p className="text-zinc-400 mb-10 text-lg font-light">
                          {t("organizer_reg_modal.success.desc")}
                        </p>
                        <button
                          onClick={onClose}
                          className="px-10 py-3 border border-zinc-700 hover:border-[#D8C97B] hover:bg-[#D8C97B] hover:text-black text-white uppercase text-xs font-bold tracking-[0.2em] transition-all"
                        >
                          {t("organizer_reg_modal.success.btn")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="hidden lg:flex w-[40%] h-full flex-col justify-center px-20 relative z-10"
              >
                <div className="space-y-16">
                  <div>
                    <h3 className="text-5xl font-serif text-white mb-6">
                      {t("organizer_reg_modal.sidebar.title")}
                    </h3>
                    <div className="w-16 h-1 bg-[#D8C97B]" />
                  </div>
                  <div className="space-y-12">
                    <div className="group">
                      <h4 className="text-[10px] font-bold text-[#D8C97B] uppercase tracking-[0.2em] mb-3">
                        {t("organizer_reg_modal.sidebar.hotline")}
                      </h4>
                      <p className="text-4xl text-white font-light group-hover:text-[#D8C97B] transition-colors cursor-pointer">
                        +84 969 838 467
                      </p>
                    </div>
                    <div className="group">
                      <h4 className="text-[10px] font-bold text-[#D8C97B] uppercase tracking-[0.2em] mb-3">
                        {t("organizer_reg_modal.sidebar.email")}
                      </h4>
                      <p className="text-2xl text-white font-light underline decoration-zinc-700 underline-offset-8 group-hover:decoration-[#D8C97B] transition-all cursor-pointer">
                        Huyen.dang@webie.com.vn
                      </p>
                    </div>
                    <div className="group">
                      <h4 className="text-[10px] font-bold text-[#D8C97B] uppercase tracking-[0.2em] mb-3">
                        {t("organizer_reg_modal.sidebar.office")}
                      </h4>
                      <div className="flex gap-4 items-start">
                        <FaMapMarkerAlt className="text-xl text-[#D8C97B] mt-1" />
                        <p className="text-zinc-400 text-lg">
                          <Trans i18nKey="organizer_reg_modal.sidebar.address" />
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {[FaFacebookF, FaLinkedinIn, FaGlobe].map((Icon, i) => (
                      <a
                        key={i}
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Social link ${i + 1}`}
                        className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-zinc-500 hover:bg-[#D8C97B] hover:text-black hover:scale-110 transition-all"
                      >
                        <Icon size={18} />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {authModalType === "LOGIN" && (
          <div className="fixed inset-0 z-10000 flex items-center justify-center">
            <LoginModal
              isOpen={true}
              onClose={() => setAuthModalType("NONE")}
              onSwitchToRegister={() => setAuthModalType("REGISTER")}
              onSwitchToForgot={() => {
                toast.info(t("organizer_reg_modal.messages.feature_update"));
              }}
            />
          </div>
        )}

        {authModalType === "REGISTER" && (
          <div className="fixed inset-0 z-10000 flex items-center justify-center">
            <RegisterModal
              isOpen={true}
              onClose={() => setAuthModalType("NONE")}
              onSwitchToLogin={() => setAuthModalType("LOGIN")}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OrganizerRegModal;
