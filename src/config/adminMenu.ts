import {
  FaChartPie,
  FaUsers,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaBuilding,
} from "react-icons/fa";
import { ROLES } from "@/constants";

export interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
}

export const ADMIN_MENU: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: FaChartPie,
    roles: [ROLES.SUPER_ADMIN, ROLES.ORGANIZER],
  },
  {
    title: "Quản lý Người dùng",
    path: "/admin/users",
    icon: FaUsers,
    roles: [ROLES.SUPER_ADMIN, ROLES.ORGANIZER],
  },

  {
    title: "Quản lý Sự kiện",
    path: "/admin/events",
    icon: FaCalendarAlt,
    roles: [ROLES.SUPER_ADMIN, ROLES.ORGANIZER],
  },

  {
    title: "Quản lý Diễn giả",
    path: "/admin/presenters",
    icon: FaChalkboardTeacher,
    roles: [ROLES.SUPER_ADMIN, ROLES.ORGANIZER],
  },

  {
    title: "Duyệt Nhà Tổ Chức",
    path: "/admin/organizers",
    icon: FaBuilding,
    roles: [ROLES.SUPER_ADMIN],
  },
];
