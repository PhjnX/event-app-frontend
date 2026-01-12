import Banner1 from "@/assets/images/Banner_1.jpg";
import Banner2 from "@/assets/images/Banner_2.jpg";
import Banner3 from "@/assets/images/Banner_3.jpg";
import IPhoneMockup from "@/assets/images/ems-iphone.png";
import IPadMockup from "@/assets/images/ems-ipad.png";
import LaptopMockup from "@/assets/images/ems-laptop.png";

export interface Slide {
  id: number;
  image: string;
  device: string;
  deviceType: "phone" | "tablet" | "laptop";
  title: string;
  highlight: string;
  subtitle: string;
  btnPrimary: string;
  pathPrimary: string;
  btnSecondary: string;
  pathSecondary: string;
}

export const SLIDES: Slide[] = [
  {
    id: 1,
    image: Banner1,
    device: IPhoneMockup,
    deviceType: "phone",
    title: "ELEVATE YOUR",
    highlight: "TECH EVENTS.",
    subtitle:
      "Trải nghiệm quản lý sự kiện chuyên nghiệp trên nền tảng di động. Nâng tầm trải nghiệm từ khâu đăng ký đến check-in nhanh chóng chỉ với một chạm.",
    btnPrimary: "KHÁM PHÁ SỰ KIỆN",
    pathPrimary: "/events",
    btnSecondary: "ĐĂNG NHẬP",
    pathSecondary: "#login",
  },
  {
    id: 2,
    image: Banner2,
    device: IPadMockup,
    deviceType: "tablet",
    title: "CONNECT &",
    highlight: "NETWORK.",
    subtitle:
      "Giao diện tối ưu trên máy tính bảng giúp bạn dễ dàng duyệt danh sách diễn giả và kết nối với các chuyên gia đầu ngành một cách trực quan nhất.",
    btnPrimary: "XEM DIỄN GIẢ",
    pathPrimary: "/events",
    btnSecondary: "VỀ CHÚNG TÔI",
    pathSecondary: "/about",
  },
  {
    id: 3,
    image: Banner3,
    device: LaptopMockup,
    deviceType: "laptop",
    title: "STREAMLINE",
    highlight: "MANAGEMENT.",
    subtitle:
      "Dành cho Ban Tổ Chức: Kiểm soát chi tiết từng hoạt động trong sự kiện, quản lý lịch trình và báo cáo số liệu thời gian thực trên giao diện laptop chuyên sâu.",
    btnPrimary: "LIÊN HỆ HỢP TÁC",
    pathPrimary: "/#contact",
    btnSecondary: "TẠO SỰ KIỆN",
    pathSecondary: "/admin/events/create",
  },
];
