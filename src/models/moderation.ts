// Trạng thái kiểm duyệt của một moment.
// - VISIBLE: hiển thị bình thường
// - UNDER_REVIEW: bị báo cáo đủ ngưỡng / admin đang xem xét -> ẩn với người khác,
//   chủ bài viết vẫn thấy kèm nhãn cảnh báo
// - REMOVED: admin đã gỡ vì vi phạm
export type MomentStatus = "VISIBLE" | "UNDER_REVIEW" | "REMOVED";

// Lý do báo cáo — khớp enum phía backend, xem docs/MODERATION_API.md
export type ReportReason =
  | "SEXUAL_CONTENT"
  | "NUDITY"
  | "VIOLENCE"
  | "HARASSMENT"
  | "HATE_SPEECH"
  | "SPAM"
  | "CSAE"
  | "OTHER";

export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";

/** Một bài viết người dùng tự ẩn trên thiết bị này. */
export interface HiddenMoment {
  id: number;
  /** Lưu lại lúc ẩn để còn nhận ra bài nào khi muốn bỏ ẩn. */
  caption?: string;
  username?: string;
  imageUrl?: string;
  hiddenAt?: string;
}

export interface BlockedUser {
  userId: number;
  username: string;
  avatarUrl?: string;
  blockedAt?: string;
}

// Một dòng trong hàng đợi báo cáo của admin
export interface MomentReport {
  id: number;
  momentId: number;
  reason: ReportReason;
  detail?: string;
  status: ReportStatus;
  createdAt: string;
  // Thông tin kèm theo để admin xét mà không phải mở thêm request
  reporterId?: number;
  reporterName?: string;
  momentCaption?: string;
  momentImageUrl?: string;
  momentStatus?: MomentStatus;
  authorId?: number;
  authorName?: string;
  authorAvatar?: string;
  eventId?: number;
  eventName?: string;
  // Số báo cáo khác nhau đang trỏ vào cùng moment này
  reportCount?: number;

  // Backend tính sẵn số giờ chờ — dùng thay cho việc tự trừ ở client
  hoursPending?: number;
  // Moment gốc đã bị xoá (chủ bài tự xoá, hoặc job dọn dẹp sau 3 ngày).
  // Ảnh và caption vẫn còn nhờ bản chụp lúc báo cáo.
  momentDeleted?: boolean;
  reporterEmail?: string;
  ownerEmail?: string;
  // Mốc hết hạn tạm khoá quyền đăng bài của chủ bài viết
  ownerSuspendedUntil?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  resolvedByUsername?: string;
}
