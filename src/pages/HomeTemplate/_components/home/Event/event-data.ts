import type { Event } from "@/pages/HomeTemplate/_components/home/models/event";

// Import ảnh dùng Alias @
import eventImg1 from "@/assets/images/Event_1.jpg";
import eventImg2 from "@/assets/images/Event_2.jpg";
import eventImg3 from "@/assets/images/Event_3.jpg";
import eventImg4 from "@/assets/images/Event_4.jpg";
import eventImg5 from "@/assets/images/Event_5.jpg";

export const SAMPLE_EVENTS: Event[] = [
  {
    eventId: 1,
    eventName: "Lễ Kỷ Niệm 30 Năm: Kiến Xây Văn Lang",
    description:
      "Hành trình kiến tạo tương lai - Sự kiện đặc biệt kỷ niệm 30 năm thành lập khoa Kiến trúc & Xây dựng.",
    startDate: "2025-06-03T14:00:00",
    endDate: "2025-06-03T16:30:00",
    location: "Hội trường N2T1, ĐH Văn Lang",
    bannerImageUrl: eventImg1,
    status: "COMING_SOON",
    organizerName: "Khoa Kiến Trúc - Xây Dựng",
  },
  // ... (Copy các phần tử còn lại vào đây y hệt sample cũ)
  {
    eventId: 2,
    eventName: "Talkshow: AI & Blockchain - Khởi Nghiệp Công Nghệ",
    description:
      "Bài học khởi nghiệp thực chiến từ các chuyên gia hàng đầu (Elsa Speak, Kyber Network, Kambria).",
    startDate: "2025-11-01T13:30:00",
    endDate: "2025-11-01T16:30:00",
    location: "Hội trường Trịnh Công Sơn, Cơ sở 3",
    bannerImageUrl: eventImg2,
    status: "OPEN",
    organizerName: "VLU Innovation Center",
  },
  {
    eventId: 3,
    eventName: "Giải Vô Địch Cờ Vua Sinh Viên TP.HCM 2025",
    description:
      "Sân chơi trí tuệ mở rộng dành cho các câu lạc bộ cờ vua sinh viên toàn thành phố.",
    startDate: "2025-12-07T08:00:00",
    endDate: "2025-12-07T17:00:00",
    location: "Lầu 4 Tòa J, Cơ sở chính VLU",
    bannerImageUrl: eventImg3,
    status: "OPEN",
    organizerName: "CLB Cờ Vua VLU",
  },
  {
    eventId: 4,
    eventName: "Open Day 2025: Summer Sense - Khối Ngành Du Lịch",
    description:
      "Trải nghiệm thực tế các ngành Quản trị Khách sạn, Dịch vụ Du lịch và Lữ hành.",
    startDate: "2025-05-10T07:00:00",
    endDate: "2025-05-10T11:30:00",
    location: "Cơ sở chính (Đặng Thùy Trâm)",
    bannerImageUrl: eventImg4,
    status: "COMING_SOON",
    organizerName: "Khoa Du Lịch",
  },
  {
    eventId: 5,
    eventName: "Open Day 2025: Tech For Future - Khối Kỹ Thuật",
    description:
      "Khám phá khối ngành Công nghệ - Kỹ thuật với chủ đề công nghệ cho tương lai.",
    startDate: "2025-04-19T07:00:00",
    endDate: "2025-04-19T11:30:00",
    location: "Cơ sở chính ĐH Văn Lang",
    bannerImageUrl: eventImg5,
    status: "OPEN",
    organizerName: "Khoa Kỹ Thuật - Công Nghệ",
  },
];
