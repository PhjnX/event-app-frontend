import apiService from "./apiService";
import { STORAGE_KEYS } from "../constants";

/**
 * Người dùng tự xoá tài khoản — bắt buộc theo chính sách Google Play.
 *
 * Luồng hai bước, dùng chung cho tài khoản thường lẫn tài khoản Google:
 *   1. POST /users/me/deletion-otp   → backend gửi mã 6 số qua email
 *   2. POST /users/me/deletion       → xác nhận bằng mã đó
 *
 * Backend trả câu thông báo tiếng Việt sẵn cho mọi mã lỗi, nên tầng giao diện
 * hiện thẳng `message` chứ không tự đặt câu khác.
 */

export type MaXoaTaiKhoan = {
  message: string;
  /** Mã còn hiệu lực trong bao nhiêu giây (hiện là 600) */
  expiresInSeconds: number;
  /** Phải chờ bao nhiêu giây mới được bấm "Gửi lại mã" */
  resendAfterSeconds: number;
};

export type KetQuaXoaTaiKhoan = { deleted: boolean; message: string };

/** Bước 1 — xin mã. Có thể trả 409 ngay nếu người dùng còn sự kiện đang hoạt động. */
export const xinMaXoaTaiKhoan = (): Promise<MaXoaTaiKhoan> =>
  apiService.post("/users/me/deletion-otp");

/** Bước 2 — xác nhận xoá. `reason` là tuỳ chọn, tối đa 500 ký tự. */
export const xacNhanXoaTaiKhoan = (
  otp: string,
  lyDo?: string,
): Promise<KetQuaXoaTaiKhoan> =>
  apiService.post("/users/me/deletion", {
    otp: otp.trim(),
    ...(lyDo?.trim() ? { reason: lyDo.trim().slice(0, 500) } : {}),
  });

/**
 * Xoá sạch phiên sau khi tài khoản đã bị xoá.
 * Mọi token cũ đều đã mất hiệu lực phía server, giữ lại chỉ gây lỗi khó hiểu.
 */
export const donDepPhienDaXoa = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem("refreshToken");
  } catch {
    /* trình duyệt chặn localStorage thì cũng không còn gì để dọn */
  }
};

/** Mã OTP phải đủ 6 chữ số — kiểm tại chỗ để khỏi nhận câu lỗi kỹ thuật từ server. */
export const maHopLe = (otp: string) => /^\d{6}$/.test(otp.trim());

export default {
  xinMaXoaTaiKhoan,
  xacNhanXoaTaiKhoan,
  donDepPhienDaXoa,
  maHopLe,
};
