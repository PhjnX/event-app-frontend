import type { Slide } from "../models/slide";
import Banner1 from "@/assets/images/Banner_1.jpg";
import Banner2 from "@/assets/images/Banner_2.jpg";
import Banner3 from "@/assets/images/Banner_3.jpg";
export const SLIDES: Slide[] = [
  {
    id: 1,
    image: Banner1,
    title: "ELEVATE YOUR",
    highlight: "TECH EVENTS.",
    subtitle:
      "Nền tảng quản lý sự kiện chuyên nghiệp dành cho Doanh nghiệp và Tổ chức giáo dục. Nâng tầm trải nghiệm từ khâu tổ chức đến check-in.",
    btnPrimary: "KHÁM PHÁ SỰ KIỆN",
    pathPrimary: "/events",
    btnSecondary: "ĐĂNG NHẬP",
    pathSecondary: "#login",
  },
  {
    id: 2,
    image: Banner2,
    title: "CONNECT &",
    highlight: "NETWORK.",
    subtitle:
      "Mở rộng mạng lưới quan hệ với các diễn giả hàng đầu và chuyên gia trong ngành. Cơ hội nghề nghiệp ngay trong tầm tay.",
    btnPrimary: "XEM LỊCH TRÌNH",
    pathPrimary: "/events",
    btnSecondary: "VỀ CHÚNG TÔI",
    pathSecondary: "/about",
  },
  {
    id: 3,
    image: Banner3,
    title: "STREAMLINE",
    highlight: "MANAGEMENT.",
    subtitle:
      "Dành cho Ban Tổ Chức: Tối ưu hóa quy trình duyệt, kiểm soát người tham dự và báo cáo số liệu thời gian thực.",
    btnPrimary: "LIÊN HỆ HỢP TÁC",
    pathPrimary: "/#contact",
    btnSecondary: "TẠO SỰ KIỆN",
    pathSecondary: "/admin/events/create", 
  },
];
