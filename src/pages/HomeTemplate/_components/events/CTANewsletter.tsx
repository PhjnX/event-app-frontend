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

export default function CTANewsletter() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const isPrivilegedUser =
    user?.role === "ORGANIZER" ||
    user?.role === "ADMIN" ||
    user?.role === "SADMIN" ||
    user?.role === ROLES.ORGANIZER ||
    user?.role === ROLES.SUPER_ADMIN;

  if (isPrivilegedUser) {
    return null;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      const storageKey = `newsletter_subscribed_${user.email}`;
      const hasSubscribed = localStorage.getItem(storageKey);

      if (hasSubscribed === "true") {
        setIsSuccess(true);
      } else {
        setIsSuccess(false);
      }
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

      toast.success("Đăng ký nhận tin tức thành công!");
      localStorage.setItem(`newsletter_subscribed_${user.email}`, "true");
      setIsSuccess(true);
    } catch (error: any) {
      if (
        error?.toString().includes("tồn tại") ||
        error?.toString().includes("exists")
      ) {
        localStorage.setItem(`newsletter_subscribed_${user.email}`, "true");
        setIsSuccess(true);
        toast.info("Bạn đã đăng ký nhận tin trước đó rồi.");
      } else {
        toast.error(error || "Có lỗi xảy ra, vui lòng thử lại sau.");
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
      <div className="container mx-auto px-4 mb-20 font-noto">
        <section className="relative rounded-[2.5rem] overflow-hidden p-10 md:p-20 text-center border border-[#B5A65F]/20 shadow-[0_0_80px_-20px_rgba(181,166,95,0.15)] group">
          <div className="absolute inset-0 bg-linear-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#050505] z-0"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#B5A65F] opacity-10 rounded-full blur-[100px] group-hover:opacity-20 transition-opacity duration-700"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-[100px]"></div>

          <div className="relative z-10 max-w-3xl mx-auto transition-all duration-500">
            {!isSuccess ? (
              <>
                <div className="w-16 h-16 bg-[#B5A65F]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#B5A65F]/20">
                  <FaPaperPlane className="text-2xl text-[#B5A65F] -translate-x-0.5 translate-y-0.5" />
                </div>

                <h2 className="text-3xl md:text-5xl font-black uppercase text-white mb-4 tracking-tight">
                  Đăng ký nhận tin tức
                </h2>
                <p className="text-gray-400 text-base md:text-lg mb-10 font-light">
                  Nhận thông báo sớm nhất về các sự kiện công nghệ, mã giảm giá
                  vé và cập nhật diễn giả hàng tuần. Không spam.
                </p>

                <form
                  onSubmit={handleAction}
                  className="flex flex-col md:flex-row gap-4 justify-center items-center"
                >
                  <div className="relative w-full md:w-96">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 z-10">
                      {user ? (
                        <FaUser className="text-[#B5A65F]" />
                      ) : (
                        <FaLock />
                      )}
                    </div>

                    <input
                      type="email"
                      required
                      readOnly={true}
                      value={user ? user.email : ""}
                      placeholder={user ? "" : "Vui lòng đăng nhập để tiếp tục"}
                      className={`
                        w-full pl-12 pr-6 py-4 rounded-full border outline-none transition-all backdrop-blur-sm
                        ${
                          user
                            ? "bg-[#B5A65F]/10 border-[#B5A65F]/50 text-[#B5A65F] font-bold cursor-default shadow-[0_0_15px_rgba(181,166,95,0.1)]"
                            : "bg-white/5 border-white/10 text-gray-400 placeholder-gray-500 cursor-not-allowed"
                        }
                      `}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`
                      px-10 py-4 font-bold uppercase tracking-widest rounded-full transition-all shadow-lg whitespace-nowrap min-w-[200px] flex items-center justify-center gap-2
                      ${
                        user
                          ? "bg-[#B5A65F] text-black hover:bg-white hover:scale-105"
                          : "bg-white/10 text-white hover:bg-[#B5A65F] hover:text-black"
                      }
                      ${isLoading ? "opacity-80 cursor-wait" : ""}
                    `}
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin text-lg" />{" "}
                        Processing
                      </>
                    ) : user ? (
                      "Đăng Ký Ngay"
                    ) : (
                      "Đăng Nhập Ngay"
                    )}
                  </button>
                </form>

                <p className="text-gray-600 text-xs mt-6">
                  {!user
                    ? "Bạn cần đăng nhập để hệ thống xác thực email chính chủ."
                    : "Hệ thống sẽ sử dụng email tài khoản hiện tại của bạn."}
                </p>
              </>
            ) : (
              <div className="py-6 animate-fade-in-up">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <FaCheckCircle className="text-4xl text-green-500" />
                </div>

                <h2 className="text-3xl md:text-4xl font-black uppercase text-white mb-4 tracking-tight">
                  Đã Đăng Ký Thành Công!
                </h2>

                <div className="bg-[#1a1a1a] inline-block px-8 py-6 rounded-2xl border border-white/10 shadow-xl max-w-lg">
                  <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest font-bold">
                    Email nhận tin
                  </p>
                  <div className="flex items-center justify-center gap-3 text-xl md:text-2xl font-bold text-[#B5A65F]">
                    <FaEnvelopeOpenText />
                    <span>{maskEmail(user?.email || "")}</span>
                  </div>
                  <div className="mt-4 h-px w-full bg-white/10"></div>
                  <p className="text-gray-500 text-xs mt-4 italic">
                    Bạn sẽ nhận được thông báo mới nhất từ Webie.
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
        onSwitchToForgot={() => toast.info("Tính năng đang phát triển")}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
}
