import type { Partner } from "@/pages/HomeTemplate/_components/home/models/partner";

// Import ảnh dùng alias @ cho gọn (nhờ config vite/tsconfig nãy làm)
import c1 from "@/assets/images/Customer_1.jpg";
import c2 from "@/assets/images/Customer_2.jpg";
import c3 from "@/assets/images/Customer_3.jpg";
import c4 from "@/assets/images/Customer_4.jpg";
import c5 from "@/assets/images/Customer_5.jpg";
import c6 from "@/assets/images/Customer_6.jpg";
import c7 from "@/assets/images/Customer_7.jpg";
import c8 from "@/assets/images/Customer_8.jpg";
import c9 from "@/assets/images/Customer_9.jpg";

export const PARTNERS: Partner[] = [
  { id: 1, logo: c1, name: "Partner 1" },
  { id: 2, logo: c2, name: "Partner 2" },
  { id: 3, logo: c3, name: "Partner 3" },
  { id: 4, logo: c4, name: "Partner 4" },
  { id: 5, logo: c5, name: "Partner 5" },
  { id: 6, logo: c6, name: "Partner 6" },
  { id: 7, logo: c7, name: "Partner 7" },
  { id: 8, logo: c8, name: "Partner 8" },
  { id: 9, logo: c9, name: "Partner 9" },
];
