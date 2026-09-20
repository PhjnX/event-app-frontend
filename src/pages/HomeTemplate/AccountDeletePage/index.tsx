import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaExclamationTriangle,
  FaEnvelopeOpenText,
  FaTrashAlt,
  FaArrowLeft,
  FaShieldAlt,
} from "react-icons/fa";

import type { RootState, AppDispatch } from "../../../store";
import { logoutUser } from "../../../store/slices/auth";
import { ROLES } from "../../../constants";
import {
  xinMaXoaTaiKhoan,
  xacNhanXoaTaiKhoan,
  donDepPhienDaXoa,
  maHopLe,
} from "../../../services/accountService";
import { getApiErrorMessage } from "../../../utils/apiError";

/**
 * Trang xoá tài khoản.
 *
 * Google Play bắt buộc có một đường dẫn web công khai để người dùng yêu cầu xoá
 * tài khoản mà không cần mở app; đường dẫn này (/account/delete) được khai
 * trong Play Console nên KHÔNG đổi. Trang mở được khi chưa đăng nhập, lúc đó
 * hiện lời mời đăng nhập thay vì đá thẳng sang trang khác.
 */

const BUOC = { CANH_BAO: 1, NHAP_MA: 2 } as const;

const phutGiay = (giay: number) => {
  const p = Math.floor(giay / 60);
  const g = giay % 60;
  return `${p}:${String(g).padStart(2, "0")}`;
};

export default function AccountDeletePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);

  const [buoc, setBuoc] = useState<number>(BUOC.CANH_BAO);
  const [dangGui, setDangGui] = useState(false);
  const [otp, setOtp] = useState("");
  const [lyDo, setLyDo] = useState("");
  const [loi, setLoi] = useState("");
  const [conLaiGuiLai, setConLaiGuiLai] = useState(0);
  const [conLaiHetHan, setConLaiHetHan] = useState(0);
  const [hoiLanCuoi, setHoiLanCuoi] = useState(false);
  const oMa = useRef<HTMLInputElement>(null);

  const laQuanTri = user?.role === ROLES.SUPER_ADMIN;

  // Hai đồng hồ đếm ngược: hạn dùng của mã, và thời gian chờ để gửi lại
  useEffect(() => {
    if (conLaiGuiLai <= 0) return;
    const t = setInterval(() => setConLaiGuiLai((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, [conLaiGuiLai]);

  useEffect(() => {
    if (conLaiHetHan <= 0) return;
    const t = setInterval(() => setConLaiHetHan((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, [conLaiHetHan]);

  const daHetHan = buoc === BUOC.NHAP_MA && conLaiHetHan === 0;

  const xinMa = async (guiLai = false) => {
    setLoi("");
    setDangGui(true);
    try {
      const res = await xinMaXoaTaiKhoan();
      setBuoc(BUOC.NHAP_MA);
      setOtp("");
      setConLaiGuiLai(res?.resendAfterSeconds ?? 60);
      setConLaiHetHan(res?.expiresInSeconds ?? 600);
      toast.success(res?.message || "Đã gửi mã xác nhận tới email của bạn.");
      setTimeout(() => oMa.current?.focus(), 100);
    } catch (e: unknown) {
      // 409: còn sự kiện đang hoạt động — message liệt kê tên sự kiện.
      // 403: tài khoản quản trị. 429: xin mã quá nhanh.
      setLoi(getApiErrorMessage(e, "Không gửi được mã xác nhận."));
      if (guiLai) setConLaiGuiLai(30);
    } finally {
      setDangGui(false);
    }
  };

  const xacNhan = async () => {
    setLoi("");
    if (!maHopLe(otp)) {
      setLoi("Mã xác nhận gồm đúng 6 chữ số.");
      return;
    }
    setDangGui(true);
    try {
      const res = await xacNhanXoaTaiKhoan(otp, lyDo);
      donDepPhienDaXoa();
      dispatch(logoutUser());
      toast.success(res?.message || "Tài khoản của bạn đã được xoá.");
      navigate("/auth", { replace: true });
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      const status = err?.response?.status;
      setLoi(getApiErrorMessage(e, "Không xoá được tài khoản."));
      // Nhập sai quá số lần cho phép thì mã bị huỷ, phải xin mã mới
      if (status === 429) {
        setBuoc(BUOC.CANH_BAO);
        setConLaiHetHan(0);
      }
      setHoiLanCuoi(false);
    } finally {
      setDangGui(false);
    }
  };

  const hauQua = useMemo(
    () => [
      "Hồ sơ cá nhân, ảnh đại diện, số điện thoại và địa chỉ bị xoá khỏi hệ thống.",
      "Toàn bộ khoảnh khắc bạn đã đăng trong các sự kiện sẽ bị xoá.",
      "Vé của những sự kiện chưa kết thúc sẽ bị huỷ, bạn không vào cổng được nữa.",
      "Nếu bạn là ban tổ chức, tài khoản tổ chức sẽ bị khoá.",
      "Không thể hoàn tác sau khi xoá.",
    ],
    [],
  );

  const khung =
    "bg-[rgba(18,18,18,0.75)] border border-[rgba(255,255,255,0.08)] rounded-3xl backdrop-blur-md";

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-noto py-20 px-4 selection:bg-[rgba(216,201,123,0.3)]">
      <div className="max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-6 cursor-pointer"
        >
          <FaArrowLeft size={12} /> Quay lại
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${khung} p-7 md:p-9`}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.35)] flex items-center justify-center text-red-400 shrink-0">
              <FaTrashAlt />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Xoá tài khoản
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Yêu cầu xoá vĩnh viễn tài khoản Webie EMS của bạn.
              </p>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="space-y-5">
              <p className="text-[15px] leading-relaxed text-gray-300">
                Để xoá tài khoản, bạn cần đăng nhập bằng chính tài khoản đó. Chúng
                tôi gửi một mã xác nhận tới email của bạn trước khi xoá, nên không
                ai khác thao tác thay bạn được.
              </p>
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="w-full py-3.5 rounded-xl bg-[#D8C97B] text-black font-bold hover:brightness-110 transition cursor-pointer"
              >
                Đăng nhập để tiếp tục
              </button>
              <p className="text-xs text-gray-500 text-center">
                Sau khi đăng nhập, mở lại trang này để hoàn tất yêu cầu xoá.
              </p>
            </div>
          ) : laQuanTri ? (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[rgba(216,201,123,0.08)] border border-[rgba(216,201,123,0.25)]">
              <FaShieldAlt className="text-[#D8C97B] mt-0.5 shrink-0" />
              <p className="text-sm text-gray-300">
                Tài khoản quản trị hệ thống không thể tự xoá. Liên hệ bộ phận kỹ
                thuật nếu bạn cần đóng tài khoản này.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">
                  Tài khoản
                </p>
                <p className="text-white font-medium">{user?.username}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>

              {buoc === BUOC.CANH_BAO && (
                <div className="space-y-6">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)]">
                    <FaExclamationTriangle className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-red-300 mb-2">
                        Những gì sẽ xảy ra
                      </p>
                      <ul className="space-y-1.5 text-sm text-gray-300 list-disc pl-4">
                        {hauQua.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {loi && (
                    <p className="text-sm text-red-400 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] rounded-xl p-3">
                      {loi}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="flex-1 py-3.5 rounded-xl border border-[rgba(255,255,255,0.15)] text-gray-300 font-semibold hover:bg-white/5 transition cursor-pointer"
                    >
                      Giữ tài khoản
                    </button>
                    <button
                      type="button"
                      disabled={dangGui}
                      onClick={() => xinMa()}
                      className="flex-1 py-3.5 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-bold transition disabled:opacity-60 cursor-pointer"
                    >
                      {dangGui ? "Đang gửi mã…" : "Tiếp tục xoá tài khoản"}
                    </button>
                  </div>
                </div>
              )}

              {buoc === BUOC.NHAP_MA && (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-[rgba(216,201,123,0.07)] border border-[rgba(216,201,123,0.25)]">
                    <FaEnvelopeOpenText className="text-[#D8C97B] mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-300">
                      Mã xác nhận gồm 6 chữ số đã được gửi tới{" "}
                      <span className="text-white">{user?.email}</span>.{" "}
                      {conLaiHetHan > 0 ? (
                        <>Mã hết hạn sau {phutGiay(conLaiHetHan)}.</>
                      ) : (
                        <span className="text-red-300">
                          Mã đã hết hạn, bấm “Gửi lại mã”.
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="ma-xac-nhan"
                      className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2"
                    >
                      Mã xác nhận
                    </label>
                    <input
                      id="ma-xac-nhan"
                      ref={oMa}
                      value={otp}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setLoi("");
                      }}
                      placeholder="000000"
                      className="w-full bg-[#0f0f0f] border border-[rgba(255,255,255,0.12)] focus:border-[#D8C97B] outline-none rounded-xl px-4 py-3.5 text-2xl tracking-[0.4em] text-center text-white font-mono"
                    />
                    {loi && <p className="text-sm text-red-400 mt-2">{loi}</p>}
                  </div>

                  <div>
                    <label
                      htmlFor="ly-do-xoa"
                      className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2"
                    >
                      Lý do rời đi{" "}
                      <span className="normal-case font-normal text-gray-500">
                        (không bắt buộc)
                      </span>
                    </label>
                    <textarea
                      id="ly-do-xoa"
                      value={lyDo}
                      onChange={(e) => setLyDo(e.target.value.slice(0, 500))}
                      rows={3}
                      placeholder="Chia sẻ giúp chúng tôi cải thiện dịch vụ…"
                      className="w-full bg-[#0f0f0f] border border-[rgba(255,255,255,0.12)] focus:border-[#D8C97B] outline-none rounded-xl px-4 py-3 text-sm text-white resize-none"
                    />
                    <p className="text-[11px] text-gray-500 text-right mt-1">
                      {lyDo.length}/500
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <button
                      type="button"
                      disabled={conLaiGuiLai > 0 || dangGui}
                      onClick={() => xinMa(true)}
                      className="text-sm text-[#D8C97B] hover:underline disabled:text-gray-500 disabled:no-underline cursor-pointer disabled:cursor-default"
                    >
                      {conLaiGuiLai > 0
                        ? `Gửi lại mã sau ${conLaiGuiLai}s`
                        : "Gửi lại mã"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBuoc(BUOC.CANH_BAO);
                        setLoi("");
                      }}
                      className="text-sm text-gray-400 hover:text-white cursor-pointer"
                    >
                      Huỷ
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={dangGui || !maHopLe(otp) || daHetHan}
                    onClick={() => setHoiLanCuoi(true)}
                    className="w-full py-3.5 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Xoá vĩnh viễn tài khoản
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>

        <p className="text-xs text-gray-600 text-center mt-6">
          Cần giúp đỡ? Liên hệ huyen.dang@webie.com.vn
        </p>
      </div>

      {hoiLanCuoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${khung} p-7 max-w-md w-full`}
          >
            <h2 className="text-xl font-bold text-white mb-2">
              Xoá tài khoản vĩnh viễn?
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Sau bước này, hồ sơ và khoảnh khắc của bạn bị xoá, vé chưa dùng bị
              huỷ. Thao tác không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setHoiLanCuoi(false)}
                className="flex-1 py-3 rounded-xl border border-[rgba(255,255,255,0.15)] text-gray-300 font-semibold hover:bg-white/5 transition cursor-pointer"
              >
                Không, giữ lại
              </button>
              <button
                type="button"
                disabled={dangGui}
                onClick={xacNhan}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition disabled:opacity-60 cursor-pointer"
              >
                {dangGui ? "Đang xoá…" : "Xoá vĩnh viễn"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
