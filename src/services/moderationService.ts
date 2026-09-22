import apiService from "@/services/apiService";
import {
  MODERATION_KEYS,
  CONTENT_POLICY_VERSION,
  AUTO_REVIEW_THRESHOLD,
} from "@/constants/moderation";
import type {
  BlockedUser,
  HiddenMoment,
  MomentReport,
  MomentStatus,
  ReportReason,
  ReportStatus,
} from "@/models/moderation";

/**
 * Dịch vụ kiểm duyệt nội dung do người dùng tạo (Moments).
 *
 * Backend chưa có các endpoint này (xem docs/MODERATION_API.md trong repo
 * event-app-mobile). Trong lúc chờ, service tự phát hiện endpoint thiếu và
 * chuyển sang chế độ cục bộ / dữ liệu mẫu, để giao diện dựng và thử được ngay
 * mà không vỡ. Khi backend lên, không phải sửa gì ở tầng UI.
 */

// 404/405/501 = endpoint chưa tồn tại. Lỗi mạng (không có response) cũng coi là chưa sẵn sàng.
export const isApiMissing = (error: any): boolean => {
  const status = error?.response?.status;
  if (status === undefined) return true;
  if (status === 404 || status === 405 || status === 501) return true;

  // Spring Boot không map được route thì rơi xuống bộ xử lý static resource và
  // ném ra lỗi 500 kèm thông điệp "No static resource ...", chứ không trả 404.
  // Về bản chất đây vẫn là "endpoint chưa có", nên phải nhận diện riêng — nếu
  // không, toàn bộ chế độ thử cục bộ sẽ không kích hoạt.
  // Chỉ bắt đúng chữ ký đó, mọi lỗi 500 khác vẫn được ném lên như thường.
  if (status === 500) {
    const data = error?.response?.data;
    const message = typeof data === "string" ? data : (data?.message ?? "");
    return (
      typeof message === "string" && message.includes("No static resource")
    );
  }

  return false;
};

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota hoặc private mode — bỏ qua */
  }
};

// Chế độ thử cục bộ
/**
 * Khi các endpoint kiểm duyệt chưa tồn tại, luồng vẫn phải chạy được trọn vẹn
 * để kiểm thử giao diện: người dùng báo cáo -> báo cáo vào hàng đợi admin ->
 * admin gỡ bài -> bài biến mất khỏi feed. Khối dưới đây mô phỏng đúng hành vi
 * mà docs/MODERATION_API.md yêu cầu ở backend, lưu trong localStorage.
 *
 * Chỉ chạy khi `isApiMissing()` đúng. Backend lên là các nhánh này không còn
 * được gọi tới, không cần gỡ code hay sửa tầng UI.
 */

/** Quyết định kiểm duyệt cho một moment, ghi đè status khi backend chưa trả về. */
interface MomentDecision {
  momentStatus: MomentStatus;
  reportStatus?: ReportStatus;
  decidedAt: string;
}

/** Thông tin kèm theo để dựng một dòng trong hàng đợi admin. */
export interface LocalReportContext {
  momentCaption?: string;
  momentImageUrl?: string;
  authorId?: number;
  authorName?: string;
  authorAvatar?: string;
  eventId?: number;
  eventName?: string;
  reporterId?: number;
  reporterName?: string;
}

export const getLocalReports = (): MomentReport[] =>
  readJson<MomentReport[]>(MODERATION_KEYS.LOCAL_REPORTS, []);

const getDecisions = (): Record<string, MomentDecision> =>
  readJson<Record<string, MomentDecision>>(MODERATION_KEYS.MOMENT_DECISIONS, {});

const setDecision = (momentId: number, decision: Omit<MomentDecision, "decidedAt">) => {
  writeJson(MODERATION_KEYS.MOMENT_DECISIONS, {
    ...getDecisions(),
    [momentId]: { ...decision, decidedAt: new Date().toISOString() },
  });
};

/** Trạng thái kiểm duyệt cục bộ theo momentId, để feed áp dụng khi backend chưa trả `status`. */
export const getMomentStatusOverrides = (): Record<number, MomentStatus> => {
  const out: Record<number, MomentStatus> = {};
  for (const [id, d] of Object.entries(getDecisions())) out[Number(id)] = d.momentStatus;
  return out;
};

/**
 * Ghi một báo cáo vào hàng đợi cục bộ và tự ẩn bài khi đủ ngưỡng — đúng quy tắc
 * §1 của spec: >= AUTO_REVIEW_THRESHOLD người báo cáo khác nhau, hoặc chỉ cần
 * một báo cáo nếu lý do là CSAE.
 */
const recordLocalReport = (
  momentId: number,
  payload: { reason: ReportReason; detail?: string },
  ctx: LocalReportContext = {},
) => {
  const list = getLocalReports();
  const reporterId = ctx.reporterId ?? 0;

  // Mỗi người chỉ báo cáo một bài một lần (backend trả 409 cho lần thứ hai)
  if (list.some((r) => r.momentId === momentId && r.reporterId === reporterId)) return;

  const report: MomentReport = {
    id: Date.now(),
    momentId,
    reason: payload.reason,
    detail: payload.detail,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    reporterId,
    reporterName: ctx.reporterName || "Bạn (thử cục bộ)",
    momentCaption: ctx.momentCaption,
    momentImageUrl: ctx.momentImageUrl,
    momentStatus: "VISIBLE",
    authorId: ctx.authorId,
    authorName: ctx.authorName,
    authorAvatar: ctx.authorAvatar,
    eventId: ctx.eventId,
    eventName: ctx.eventName,
  };

  const next = [report, ...list];
  const reporters = new Set(
    next.filter((r) => r.momentId === momentId).map((r) => r.reporterId),
  );
  const count = reporters.size;
  for (const r of next) if (r.momentId === momentId) r.reportCount = count;

  writeJson(MODERATION_KEYS.LOCAL_REPORTS, next);

  if (payload.reason === "CSAE" || count >= AUTO_REVIEW_THRESHOLD) {
    setDecision(momentId, { momentStatus: "UNDER_REVIEW" });
  }
};

/** Xoá sạch dữ liệu kiểm duyệt cục bộ để chạy lại kịch bản thử từ đầu. */
export const clearModerationTestData = () => {
  for (const key of Object.values(MODERATION_KEYS)) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* bỏ qua */
    }
  }
};

// Báo cáo moment
export interface ReportResult {
  /** true khi báo cáo chỉ được ghi nhận cục bộ vì backend chưa có endpoint */
  localOnly: boolean;
}

export const reportMoment = async (
  eventId: number | string,
  momentId: number,
  payload: { reason: ReportReason; detail?: string },
  /** Chỉ dùng ở chế độ thử cục bộ, để hàng đợi admin có đủ thông tin hiển thị. */
  context?: LocalReportContext,
): Promise<ReportResult> => {
  try {
    await apiService.post(
      `/events/${eventId}/moments/${momentId}/report`,
      payload,
    );
    return { localOnly: false };
  } catch (error: any) {
    // 409 = đã báo cáo trước đó, với người dùng vẫn là thành công
    if (error?.response?.status === 409) return { localOnly: false };
    if (isApiMissing(error)) {
      recordLocalReport(momentId, payload, {
        eventId: Number(eventId) || undefined,
        ...context,
      });
      return { localOnly: true };
    }
    throw error;
  }
};

// Chặn / bỏ chặn
export const blockUser = async (u: BlockedUser): Promise<{ localOnly: boolean }> => {
  let localOnly = false;
  try {
    await apiService.post(`/users/${u.userId}/block`);
  } catch (error) {
    if (!isApiMissing(error)) throw error;
    localOnly = true;
  }
  const list = getCachedBlockedUsers();
  if (!list.some((x) => x.userId === u.userId)) {
    writeJson(MODERATION_KEYS.BLOCKED_USERS, [
      ...list,
      { ...u, blockedAt: new Date().toISOString() },
    ]);
  }
  return { localOnly };
};

export const unblockUser = async (userId: number) => {
  try {
    await apiService.delete(`/users/${userId}/block`);
  } catch (error) {
    if (!isApiMissing(error)) throw error;
  }
  const next = getCachedBlockedUsers().filter((x) => x.userId !== userId);
  writeJson(MODERATION_KEYS.BLOCKED_USERS, next);
  return next;
};

export const getCachedBlockedUsers = (): BlockedUser[] =>
  readJson<BlockedUser[]>(MODERATION_KEYS.BLOCKED_USERS, []);

/** Đồng bộ danh sách chặn từ server; giữ cache nếu endpoint chưa có. */
export const syncBlockedUsers = async (): Promise<BlockedUser[]> => {
  try {
    const res: any = await apiService.get(`/users/me/blocks`, {
      params: { page: 0, size: 100 },
    });
    const raw = res?.content ?? res?.data?.content ?? res;
    const list: BlockedUser[] = Array.isArray(raw) ? raw : [];
    writeJson(MODERATION_KEYS.BLOCKED_USERS, list);
    return list;
  } catch {
    return getCachedBlockedUsers();
  }
};

// Ẩn bài cục bộ
/**
 * Danh sách bài người dùng tự ẩn trên thiết bị này.
 *
 * Bản đầu chỉ lưu mảng id thuần, nên không có cách nào hiện ra cho người dùng
 * biết họ đã ẩn bài nào để mà bỏ ẩn. Nay lưu kèm caption và tên tác giả. Dữ
 * liệu cũ vẫn đọc được — id thuần được nâng cấp tại chỗ, không mất gì.
 */
export const getHiddenMoments = (): HiddenMoment[] => {
  const raw = readJson<unknown[]>(MODERATION_KEYS.HIDDEN_MOMENTS, []);
  return raw
    .map((x) => (typeof x === "number" ? { id: x } : (x as HiddenMoment)))
    .filter((x) => typeof x?.id === "number");
};

export const getHiddenMomentIds = (): number[] =>
  getHiddenMoments().map((h) => h.id);

export const hideMomentLocally = (
  momentId: number,
  meta?: Omit<HiddenMoment, "id" | "hiddenAt">,
): number[] => {
  const list = getHiddenMoments();
  if (!list.some((h) => h.id === momentId)) {
    list.push({ ...meta, id: momentId, hiddenAt: new Date().toISOString() });
    writeJson(MODERATION_KEYS.HIDDEN_MOMENTS, list);
  }
  return list.map((h) => h.id);
};

/** Bỏ ẩn một bài đã ẩn trên thiết bị này. */
export const unhideMomentLocally = (momentId: number): HiddenMoment[] => {
  const next = getHiddenMoments().filter((h) => h.id !== momentId);
  writeJson(MODERATION_KEYS.HIDDEN_MOMENTS, next);
  return next;
};

/**
 * Phiên bản quy tắc đang áp dụng. Mặc định lấy hằng số trong code, rồi cập nhật
 * theo server qua fetchCurrentPolicyVersion(). Nhờ vậy khi backend nâng phiên
 * bản (đổi nội dung quy tắc), người dùng được hỏi đồng ý lại mà không phải phát
 * hành bản web/app mới.
 */
let phienBanHienTai = CONTENT_POLICY_VERSION;

/**
 * GET /users/content-policy/version — công khai, không cần token. Lỗi mạng thì
 * giữ phiên bản đang có, không chặn luồng đăng bài.
 */
export const fetchCurrentPolicyVersion = async (): Promise<string> => {
  try {
    const res: any = await apiService.get(`/users/content-policy/version`);
    const v = res?.currentVersion ?? res?.data?.currentVersion;
    if (typeof v === "string" && v.trim()) phienBanHienTai = v.trim();
  } catch {
    /* giữ phiên bản đang có */
  }
  return phienBanHienTai;
};

export const getCurrentPolicyVersion = () => phienBanHienTai;

export const hasAcceptedCurrentPolicy = (): boolean => {
  try {
    return (
      localStorage.getItem(MODERATION_KEYS.POLICY_ACCEPTED) === phienBanHienTai
    );
  } catch {
    return false;
  }
};

/**
 * Đồng bộ trạng thái đồng ý quy tắc từ server.
 *
 * GET /users/me nay trả `contentPolicyAcceptedVersion`. Nhờ đó người đã đồng ý
 * trên mobile không bị hỏi lại khi mở web, và ngược lại. Lưu ý payload của
 * /auth/signin vẫn trả null nên phải lấy từ /users/me.
 */
export const syncPolicyAcceptance = (
  serverVersion?: string | null,
): boolean => {
  if (serverVersion && serverVersion === phienBanHienTai) {
    try {
      localStorage.setItem(MODERATION_KEYS.POLICY_ACCEPTED, serverVersion);
    } catch {
      /* bỏ qua */
    }
    return true;
  }
  return hasAcceptedCurrentPolicy();
};

export const acceptContentPolicy = async () => {
  try {
    localStorage.setItem(MODERATION_KEYS.POLICY_ACCEPTED, phienBanHienTai);
  } catch {
    /* bỏ qua */
  }
  try {
    await apiService.post(`/users/me/accept-content-policy`, {
      version: phienBanHienTai,
    });
  } catch {
    // best-effort, không chặn luồng đăng bài
  }
};

// Admin
export interface ReportListResult {
  items: MomentReport[];
  /** true khi đang hiển thị dữ liệu mẫu vì backend chưa có endpoint */
  isSample: boolean;
}

/**
 * Chuẩn hoá một dòng báo cáo từ backend về đúng tên trường mà giao diện dùng.
 *
 * Backend đặt tên theo góc nhìn "chủ bài viết" (`ownerId`, `ownerUsername`) và
 * `totalReportsOnMoment`, trong khi giao diện dựng theo `authorId`,
 * `authorName`, `reportCount`. Không ánh xạ thì bảng admin hiện toàn ô trống.
 * Giữ cả hai tên để dữ liệu mẫu cũ vẫn chạy.
 */
const normalizeReport = (r: any): MomentReport => ({
  ...r,
  authorId: r.authorId ?? r.ownerId,
  authorName: r.authorName ?? r.ownerUsername,
  reporterName: r.reporterName ?? r.reporterUsername,
  reportCount: r.reportCount ?? r.totalReportsOnMoment,
  // Đã đề nghị backend thêm tên sự kiện vào /admin/reports. Chưa chắc họ đặt
  // tên trường thế nào nên nhận mấy cách hay gặp; thiếu thì giao diện ẩn đi.
  eventName:
    r.eventName ?? r.eventTitle ?? r.event?.eventName ?? r.event?.name,
});

export const getReports = async (
  status: string = "PENDING",
): Promise<ReportListResult> => {
  try {
    // Backend nhận PENDING | RESOLVED | DISMISSED, và bỏ trống để lấy tất cả.
    // Gửi "ALL" không khớp enum nào nên phải bỏ hẳn tham số.
    const params: Record<string, any> = { page: 0, size: 100 };
    if (status !== "ALL") params.status = status;

    const res: any = await apiService.get(`/admin/reports`, { params });
    const raw = res?.content ?? res?.data?.content ?? res;
    const items = Array.isArray(raw) ? raw.map(normalizeReport) : [];
    return { items, isSample: false };
  } catch (error) {
    if (isApiMissing(error)) {
      // Báo cáo do người dùng vừa tạo đứng trước dữ liệu mẫu, và cả hai đều
      // phải phản ánh quyết định admin đã ghi ở lần thao tác trước.
      const decisions = getDecisions();
      const applyDecision = (r: MomentReport): MomentReport => {
        const d = decisions[r.momentId];
        if (!d) return r;
        return {
          ...r,
          momentStatus: d.momentStatus,
          status: d.reportStatus ?? r.status,
        };
      };
      const items = [...getLocalReports(), ...SAMPLE_REPORTS]
        .map(applyDecision)
        .filter((r) => (status === "ALL" ? true : r.status === status));
      return { items, isSample: true };
    }
    throw error;
  }
};

export const removeMoment = async (momentId: number, note: string) => {
  try {
    await apiService.post(`/admin/moments/${momentId}/remove`, { note });
    return { localOnly: false };
  } catch (error) {
    if (isApiMissing(error)) {
      setDecision(momentId, { momentStatus: "REMOVED", reportStatus: "RESOLVED" });
      return { localOnly: true };
    }
    throw error;
  }
};

export const restoreMoment = async (momentId: number) => {
  try {
    await apiService.post(`/admin/moments/${momentId}/restore`);
    return { localOnly: false };
  } catch (error) {
    if (isApiMissing(error)) {
      setDecision(momentId, { momentStatus: "VISIBLE", reportStatus: "DISMISSED" });
      return { localOnly: true };
    }
    throw error;
  }
};

export const suspendUser = async (
  userId: number,
  days: number,
  reason: string,
) => {
  try {
    await apiService.post(`/admin/users/${userId}/suspend`, { days, reason });
    return { localOnly: false };
  } catch (error) {
    if (isApiMissing(error)) return { localOnly: true };
    throw error;
  }
};

/**
 * Dữ liệu mẫu để dựng và thử giao diện admin khi backend chưa có
 * `GET /admin/reports`. Trang luôn hiển thị banner nói rõ đây là dữ liệu mẫu.
 */
const SAMPLE_REPORTS: MomentReport[] = [
  {
    id: 1,
    momentId: 1041,
    reason: "CSAE",
    detail: "Ảnh có trẻ em trong tình huống không phù hợp.",
    status: "PENDING",
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    reporterId: 88,
    reporterName: "Trần Thu Hà",
    momentCaption: "Khoảnh khắc hậu trường workshop",
    momentStatus: "UNDER_REVIEW",
    authorId: 214,
    authorName: "Lê Minh Quân",
    eventId: 12,
    eventName: "Webie Tech Summit 2026",
    reportCount: 1,
  },
  {
    id: 2,
    momentId: 1038,
    reason: "SEXUAL_CONTENT",
    detail: "Ảnh phản cảm, không liên quan tới sự kiện.",
    status: "PENDING",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    reporterId: 91,
    reporterName: "Nguyễn Văn An",
    momentCaption: "Sau bữa tiệc tối 🎉",
    momentStatus: "UNDER_REVIEW",
    authorId: 187,
    authorName: "Phạm Hoài Nam",
    eventId: 12,
    eventName: "Webie Tech Summit 2026",
    reportCount: 4,
  },
  {
    id: 3,
    momentId: 1029,
    reason: "SPAM",
    detail: "Đăng link bán hàng lặp lại nhiều lần.",
    status: "PENDING",
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    reporterId: 77,
    reporterName: "Đỗ Thanh Mai",
    momentCaption: "Giảm giá 50% khoá học, inbox ngay...",
    momentStatus: "VISIBLE",
    authorId: 302,
    authorName: "Vũ Thị Lan",
    eventId: 9,
    eventName: "Ngày hội Việc làm CNTT",
    reportCount: 2,
  },
  {
    id: 4,
    momentId: 1012,
    reason: "HARASSMENT",
    detail: "Bình phẩm xúc phạm ngoại hình người khác.",
    status: "RESOLVED",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reporterId: 64,
    reporterName: "Hoàng Bảo Long",
    momentCaption: "Nhìn cái mặt kia là hết muốn ăn",
    momentStatus: "REMOVED",
    authorId: 155,
    authorName: "Ngô Gia Huy",
    eventId: 9,
    eventName: "Ngày hội Việc làm CNTT",
    reportCount: 5,
  },
];

export default {
  isApiMissing,
  reportMoment,
  blockUser,
  unblockUser,
  getCachedBlockedUsers,
  syncBlockedUsers,
  getHiddenMomentIds,
  getHiddenMoments,
  hideMomentLocally,
  unhideMomentLocally,
  hasAcceptedCurrentPolicy,
  fetchCurrentPolicyVersion,
  getCurrentPolicyVersion,
  syncPolicyAcceptance,
  acceptContentPolicy,
  getReports,
  removeMoment,
  restoreMoment,
  suspendUser,
  getLocalReports,
  getMomentStatusOverrides,
  clearModerationTestData,
};
