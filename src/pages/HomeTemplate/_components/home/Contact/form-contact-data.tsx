// src/pages/HomeTemplate/_components/home/Registration/data.tsx
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import type { ContactItem } from "@/pages/HomeTemplate/_components/home/models/form";

export const CONTACT_INFO: ContactItem[] = [
  {
    id: 1,
    icon: <FaMapMarkerAlt size={20} />,
    title: "Trụ Sở Chính",
    content: "69/68 Đặng Thùy Trâm, P.13, Q. Bình Thạnh, TP.HCM",
  },
  {
    id: 2,
    icon: <FaEnvelope size={20} />,
    title: "Email Hợp Tác",
    content: "partnership@webie.vn",
  },
  {
    id: 3,
    icon: <FaPhoneAlt size={20} />,
    title: "Hotline",
    content: "(+84) 909 123 456",
  },
];
