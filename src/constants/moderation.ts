import type { ReportReason, ReportStatus } from "@/models/moderation";

// Phiên bản quy tắc cộng đồng hiện hành. Tăng số này khi nội dung thay đổi
// để bắt người dùng đồng ý lại. Phải khớp với bản mobile.
export const CONTENT_POLICY_VERSION = "1.0";

// Khoá lưu cục bộ (localStorage)
export const MODERATION_KEYS = {
  POLICY_ACCEPTED: "moderation:contentPolicyAcceptedVersion",
  HIDDEN_MOMENTS: "moderation:hiddenMomentIds",
  BLOCKED_USERS: "moderation:blockedUsers",
  // Hai khoá dưới chỉ dùng khi backend chưa có API — xem "chế độ thử cục bộ"
  // trong src/services/moderationService.ts
  LOCAL_REPORTS: "moderation:localReports",
  MOMENT_DECISIONS: "moderation:momentDecisions",
};

// Số người báo cáo khác nhau đủ để tự động ẩn một bài chờ duyệt.
// Khớp với ngưỡng đề xuất cho backend trong docs/MODERATION_API.md.
export const AUTO_REVIEW_THRESHOLD = 3;

// Kênh tiếp nhận phản hồi / khiếu nại về nội dung
export const MODERATION_CONTACT_EMAIL = "webie.member2@gmail.com";

export interface ReportReasonOption {
  value: ReportReason;
  label: string;
  description: string;
}

export const REPORT_REASONS: ReportReasonOption[] = [
  {
    value: "SEXUAL_CONTENT",
    label: "Nội dung tình dục",
    description: "Hình ảnh, mô tả khiêu dâm hoặc gợi dục",
  },
  {
    value: "NUDITY",
    label: "Ảnh khoả thân",
    description: "Ảnh khoả thân hoặc hở hang phản cảm",
  },
  {
    value: "VIOLENCE",
    label: "Bạo lực / máu me",
    description: "Cảnh bạo lực, thương tích, kích động bạo lực",
  },
  {
    value: "HARASSMENT",
    label: "Quấy rối / bắt nạt",
    description: "Xúc phạm, đe doạ hoặc nhắm vào một cá nhân",
  },
  {
    value: "HATE_SPEECH",
    label: "Ngôn từ thù ghét",
    description: "Phân biệt chủng tộc, tôn giáo, giới tính...",
  },
  {
    value: "SPAM",
    label: "Spam / lừa đảo",
    description: "Quảng cáo rác, lừa đảo, nội dung trùng lặp",
  },
  {
    value: "CSAE",
    label: "Xâm hại trẻ em",
    description: "Nội dung lạm dụng hoặc bóc lột trẻ em",
  },
  {
    value: "OTHER",
    label: "Lý do khác",
    description: "Vi phạm quy tắc cộng đồng theo cách khác",
  },
];

// Nhãn ngắn dùng trong bảng admin
export const REASON_LABEL: Record<ReportReason, string> = {
  SEXUAL_CONTENT: "Nội dung tình dục",
  NUDITY: "Ảnh khoả thân",
  VIOLENCE: "Bạo lực",
  HARASSMENT: "Quấy rối",
  HATE_SPEECH: "Thù ghét",
  SPAM: "Spam",
  CSAE: "Xâm hại trẻ em",
  OTHER: "Khác",
};

// Lý do nghiêm trọng — admin phải xử lý trước, hiển thị nổi bật
export const SEVERE_REASONS: ReportReason[] = [
  "CSAE",
  "SEXUAL_CONTENT",
  "NUDITY",
];

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: "Chờ xử lý",
  RESOLVED: "Đã gỡ bài",
  DISMISSED: "Đã bỏ qua",
};

// Nội dung quy tắc cộng đồng — giữ đồng bộ với bản mobile
export const COMMUNITY_GUIDELINES: { heading: string; body: string }[] = [
  {
    heading: "Moments là không gian chung",
    body: "Ảnh và caption bạn đăng trong Moments sẽ hiển thị cho những người tham gia cùng sự kiện. Hãy đăng nội dung mà bạn thoải mái chia sẻ công khai.",
  },
  {
    heading: "Nội dung bị cấm tuyệt đối",
    body: "Không đăng nội dung tình dục, khoả thân, bạo lực/máu me, ngôn từ thù ghét, quấy rối hay bắt nạt, nội dung xâm hại trẻ em, và bất kỳ hoạt động bất hợp pháp nào.",
  },
  {
    heading: "Tôn trọng người khác",
    body: "Chỉ đăng ảnh có người khác khi họ đồng ý. Không mạo danh, không tiết lộ thông tin cá nhân của người khác, không spam hay quảng cáo.",
  },
  {
    heading: "Báo cáo và chặn",
    body: "Nếu thấy nội dung vi phạm, hãy nhấn nút … trên bài viết để Báo cáo. Bạn cũng có thể Chặn người dùng để không còn thấy nội dung của họ. Mọi báo cáo được xem xét trong vòng 24 giờ.",
  },
  {
    heading: "Hậu quả khi vi phạm",
    body: "Nội dung vi phạm sẽ bị gỡ. Tài khoản vi phạm nhiều lần hoặc nghiêm trọng sẽ bị hạn chế đăng bài hoặc khoá vĩnh viễn.",
  },
];
