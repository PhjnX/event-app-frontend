import {
  FaChartPie,
  FaUsers,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaBuilding,
  FaNewspaper,
} from "react-icons/fa";
import { ROLES } from "@/constants";

// FIX: Xóa từ khóa 'export' vì interface này chỉ dùng nội bộ cho hằng số ADMIN_MENU bên dưới
interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
}

export const ADMIN_MENU: MenuItem[] = [
  {
    title: "Trang Chủ",
    path: "/admin/dashboard",
    icon: FaChartPie,
    roles: [ROLES.SUPER_ADMIN, ROLES.ORGANIZER],
  },
  {
    title: "Quản lý Người Dùng",
    path: "/admin/users",
    icon: FaUsers,
    roles: [ROLES.SUPER_ADMIN, ROLES.ORGANIZER],
  },

  {
    title: "Quản lý Sự Kiện",
    path: "/admin/events",
    icon: FaCalendarAlt,
    roles: [ROLES.SUPER_ADMIN, ROLES.ORGANIZER],
  },

  {
    title: "Quản lý Khách Mời",
    path: "/admin/presenters",
    icon: FaChalkboardTeacher,
    roles: [ROLES.SUPER_ADMIN, ROLES.ORGANIZER],
  },

  {
    title: "Quản Lý Nhà Tổ Chức",
    path: "/admin/organizers",
    icon: FaBuilding,
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    title: "Quản lý Tin Tức",
    path: "/admin/news",
    icon: FaNewspaper,
    roles: [ROLES.SUPER_ADMIN],
  },
];
