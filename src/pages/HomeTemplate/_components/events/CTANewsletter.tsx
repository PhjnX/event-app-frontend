import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaPaperPlane,
  FaSpinner,
  FaCheckCircle,
  FaUser,
  FaLock,
  FaEnvelopeOpenText,
} from "react-icons/fa";
import { toast } from "react-toastify";

import type { AppDispatch, RootState } from "@/store";
import { subscribeNewsletter } from "@/store/slices/eventSlice";
import { ROLES } from "@/constants";

import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";
// 1. IMPORT HOOK
import { useTranslation } from "react-i18next";

const BackgroundDecoration = () => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[#0a0a0a]"></div>
    <div
      className="absolute inset-0 opacity-[0.1]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)",
        backgroundSize: "30px 30px",
      }}
    />
    <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]"></div>
  </div>
);

export default function CTANewsletter() {
  // 2. SỬ DỤNG HOOK
  const { t } = useTranslation();

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector(
    (state: RootState) => state.auth as RootState["auth"],
  );

  const isPrivilegedUser =
    user?.role === "ORGANIZER" ||
    user?.role === "ADMIN" ||
    user?.role === "SADMIN" ||
    user?.role === ROLES.ORGANIZER ||
    user?.role === ROLES.SUPER_ADMIN;

  if (isPrivilegedUser) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      const storageKey = `newsletter_subscribed_${user.email}`;
      const hasSubscribed = localStorage.getItem(storageKey);
      setIsSuccess(hasSubscribed === "true");
    } else {
      setIsSuccess(false);
    }
  }, [user]);

  const maskEmail = (email: string) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    setIsLoading(true);
    try {
      await dispatch(subscribeNewsletter(user.email)).unwrap();
      // Dịch thông báo thành công
      toast.success(t("events_page.newsletter.messages.success"));
      localStorage.setItem(`newsletter_subscribed_${user.email}`, "true");
      setIsSuccess(true);
    } catch (error: any) {
      if (
        error?.toString().includes("tồn tại") ||
        error?.toString().includes("exists")
      ) {
        localStorage.setItem(`newsletter_subscribed_${user.email}`, "true");
        setIsSuccess(true);
        // Dịch thông báo đã tồn tại
        toast.info(t("events_page.newsletter.messages.already_exists"));
      } else {
        // Dịch thông báo lỗi chung
        toast.error(error || t("events_page.newsletter.messages.error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchToRegister = () => {
    setIsLoginOpen(false);
    setTimeout(() => setIsRegisterOpen(true), 200);
  };
  const switchToLogin = () => {
    setIsRegisterOpen(false);
    setTimeout(() => setIsLoginOpen(true), 200);
  };

  return (
    <>
      <div className="container mx-auto px-4 mb-24 font-noto">
        <section className="relative w-full rounded-4xl overflow-hidden bg-[#0a0a0a]">
          <BackgroundDecoration />

          <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20 md:py-24 text-center min-h-[400px]">
            {!isSuccess ? (
              <>
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                  <FaPaperPlane className="text-2xl md:text-3xl text-[#D8C97B] -translate-x-0.5 translate-y-0.5 ml-[-2px] mt-[2px]" />
                </div>

                <h2 className="text-3xl md:text-5xl font-black uppercase text-white mb-4 tracking-tight">
                  {t("events_page.newsletter.title")}
                </h2>

                <p className="text-gray-400 text-base md:text-lg mb-10 font-light max-w-xl mx-auto leading-relaxed">
                  {t("events_page.newsletter.desc")}{" "}
                  <span className="text-[#D8C97B] font-medium">
                    {t("events_page.newsletter.no_spam")}
                  </span>
                </p>

                <form
                  onSubmit={handleAction}
                  className="w-full max-w-lg flex flex-col md:flex-row gap-4 items-stretch justify-center"
                >
                  <div className="relative flex-1 group/input">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 z-10 group-focus-within/input:text-[#D8C97B] transition-colors">
                      {user ? <FaUser /> : <FaLock />}
                    </div>
                    <input
                      type="email"
                      required
                      readOnly={true}
                      value={user ? user.email : ""}
                      // Dịch placeholder
                      placeholder={
                        user
                          ? ""
                          : t("events_page.newsletter.input_placeholder")
                      }
                      className={`
                        w-full h-14 pl-12 pr-6 rounded-xl border outline-none transition-all duration-300
                        ${
                          user
                            ? "bg-[#111] border-[#D8C97B]/30 text-white font-medium shadow-inner"
                            : "bg-white/5 border-white/10 text-gray-400 placeholder-gray-600 cursor-not-allowed hover:bg-white/10"
                        }
                      `}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`
                      h-14 px-8 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap
                      ${
                        user
                          ? "bg-[#D8C97B] text-black hover:bg-white hover:scale-105 active:scale-95"
                          : "bg-white/10 text-gray-400 border border-white/10 hover:bg-white/20 hover:text-white"
                      }
                      ${isLoading ? "opacity-80 cursor-wait" : ""}
                    `}
                  >
                    {isLoading ? (
                      <FaSpinner className="animate-spin text-lg" />
                    ) : user ? (
                      t("events_page.newsletter.btn_subscribe")
                    ) : (
                      t("events_page.newsletter.btn_login")
                    )}
                  </button>
                </form>

                <p className="text-gray-600 text-[11px] mt-6 tracking-wide">
                  {!user
                    ? t("events_page.newsletter.note_login")
                    : t("events_page.newsletter.note_auth")}
                </p>
              </>
            ) : (
              <div className="animate-fade-in-up flex flex-col items-center justify-center w-full h-full">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                  <FaCheckCircle className="text-4xl text-green-500" />
                </div>

                <h2 className="text-3xl font-black uppercase text-white mb-8 tracking-tight">
                  {t("events_page.newsletter.success.title")}
                </h2>

                <div className="bg-[#111] w-full max-w-md p-8 rounded-2xl border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#D8C97B] to-transparent opacity-50"></div>

                  <p className="text-gray-500 text-xs mb-3 uppercase tracking-widest font-bold">
                    {t("events_page.newsletter.success.email_label")}
                  </p>
                  <div className="flex items-center justify-center gap-3 text-xl font-bold text-white mb-6">
                    <FaEnvelopeOpenText className="text-[#D8C97B]" />
                    <span>{maskEmail(user?.email || "")}</span>
                  </div>
                  <div className="h-px w-full bg-white/5 mb-5"></div>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">
                    {t("events_page.newsletter.success.message")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={switchToRegister}
        onSwitchToForgot={() =>
          toast.info(t("events_page.newsletter.messages.feature_dev"))
        }
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
}
