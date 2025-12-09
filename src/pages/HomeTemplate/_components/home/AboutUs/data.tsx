// src/pages/HomeTemplate/_components/home/AboutUs/data.tsx
// Lưu ý đuôi file là .tsx vì có chứa JSX (Icon)
import { FaUsers, FaLightbulb, FaRocket } from "react-icons/fa";
import type { AboutSlide } from "@/pages/HomeTemplate/_components/home/models/about-slide";

import teamMember from "@/assets/images/webie_team.jpg";
import CEO from "@/assets/images/CEO.jpg";
import Event from "@/assets/images/EventJoin.jpg";

export const SLIDE_DATA: AboutSlide[] = [
  {
    id: 1,
    image: teamMember,
    icon: <FaUsers />,
    label: "Sức Mạnh Tập Thể",
    title: "15+ Chuyên gia nòng cốt",
    desc: "Đội ngũ trẻ, sáng tạo và nhiệt huyết.",
    color: "#B5A65F",
  },
  {
    id: 2,
    image: CEO,
    icon: <FaLightbulb />,
    label: "Tầm Nhìn Lãnh Đạo",
    title: "Chiến lược tiên phong",
    desc: "Dẫn dắt đổi mới công nghệ sự kiện.",
    color: "#F472B6",
  },
  {
    id: 3,
    image: Event,
    icon: <FaRocket />,
    label: "Dấu Ấn Thực Tế",
    title: "50+ Sự kiện thành công",
    desc: "Vận hành trơn tru, trải nghiệm đẳng cấp.",
    color: "#4ADE80",
  },
];
