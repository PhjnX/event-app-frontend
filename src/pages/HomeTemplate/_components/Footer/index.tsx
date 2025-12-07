import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaChevronDown,
} from "react-icons/fa";
import { motion, type Variants } from "framer-motion";
import logoImage from "../../../../assets/images/Logo_EMS.png";

// ... (Giữ nguyên các interface và variants containerVariants, itemVariants cũ) ...
interface FooterLink {
  label: string;
  path: string;
}
interface FooterSectionData {
  id: string;
  title: string;
  links: FooterLink[];
}
interface SocialLink {
  id: string;
  icon: React.ReactNode;
  url: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    quickLinks: false,
    company: false,
    support: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ... (Giữ nguyên dữ liệu footerSections và socialLinks) ...
  const footerSections: FooterSectionData[] = [
    // ... Copy lại dữ liệu cũ ...
    {
      id: "quickLinks",
      title: "Trang Chủ",
      links: [
        { label: "Ngành nghề", path: "#" },
        { label: "Giải pháp", path: "#" },
        { label: "Tài nguyên", path: "#" },
        { label: "Hỗ trợ", path: "#" },
      ],
    },
    {
      id: "company",
      title: "Công ty",
      links: [
        { label: "Liên hệ", path: "#" },
        { label: "Về Chúng Tôi", path: "#" },
        { label: "Tuyển Dụng", path: "#" },
        { label: "Blog", path: "#" },
      ],
    },
    {
      id: "support",
      title: "Hỗ trợ",
      links: [
        { label: "Trung Tâm Trợ Giúp", path: "#" },
        { label: "Tài Liệu", path: "#" },
        { label: "Chính Sách Bảo Mật", path: "#" },
        { label: "Điều Khoản Sử Dụng", path: "#" },
      ],
    },
  ];

  const socialLinks: SocialLink[] = [
    { id: "facebook", icon: <FaFacebookF />, url: "#" },
    { id: "twitter", icon: <FaTwitter />, url: "#" },
    { id: "linkedin", icon: <FaLinkedinIn />, url: "#" },
    { id: "instagram", icon: <FaInstagram />, url: "#" },
    { id: "youtube", icon: <FaYoutube />, url: "#" },
  ];

  return (
    <footer
      className="relative mt-auto text-white pt-20 pb-10 overflow-hidden font-sans border-t border-white/5"
      style={{
        backgroundColor: "#0a0a0a", // NỀN ĐEN KHỚP VỚI SECTION TRÊN
        backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }}
    >
      {/* ĐÃ XÓA DIV BACKGROUND DECOR MÀU VÀNG Ở ĐÂY */}

      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* ... (Giữ nguyên nội dung bên trong như code trước) ... */}
          {/* CỘT 1 */}
          <motion.div
            className="lg:col-span-2 flex flex-col items-center lg:items-start text-center lg:text-left"
            variants={itemVariants}
          >
            <Link to="/" className="mb-6 inline-block group">
              <img
                src={logoImage}
                alt="Webie Event"
                className="h-[50px] w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-[400px] mx-auto lg:mx-0">
              Nền tảng quản lý sự kiện chuyên nghiệp, giúp bạn tổ chức và quản
              lý các sự kiện hiệu quả.
            </p>
            <div className="flex gap-3 justify-center lg:justify-start">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 transition-all duration-300 hover:bg-[#B5A65F] hover:border-[#B5A65F] hover:text-black hover:-translate-y-1"
                >
                  <span className="text-sm">{social.icon}</span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* CÁC CỘT LINKS */}
          {footerSections.map((section) => (
            <motion.div
              key={section.id}
              className="flex flex-col"
              variants={itemVariants}
            >
              <h3 className="lg:block text-sm font-bold mb-6 uppercase tracking-widest text-white border-b border-[#B5A65F]/30 pb-2 inline-block w-fit">
                {section.title}
              </h3>
              <button
                onClick={() => toggleSection(section.id)}
                className="lg:hidden w-full flex items-center justify-between py-3 border-b border-white/10 text-left bg-transparent"
                type="button"
              >
                <h3 className="text-[15px] font-bold uppercase tracking-wider text-white m-0">
                  {section.title}
                </h3>
                <span
                  className={`text-white/50 transition-transform duration-300 ${
                    openSections[section.id] ? "rotate-180 text-[#B5A65F]" : ""
                  }`}
                >
                  <FaChevronDown size={12} />
                </span>
              </button>
              <ul
                className={`list-none p-0 m-0 flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out ${
                  openSections[section.id]
                    ? "max-h-[500px] pt-4 opacity-100"
                    : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100 lg:pt-0"
                }`}
              >
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-400 text-sm no-underline transition-all duration-300 hover:text-[#B5A65F] hover:pl-2 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* BOTTOM */}
        <motion.div
          className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-5 text-center md:text-left"
          variants={itemVariants}
        >
          <p className="text-gray-500 text-xs m-0 font-light">
            &copy; {currentYear}{" "}
            <span className="text-gray-300 font-medium">Webie Event</span>.
            Designed for Professionals.
          </p>
          <div className="flex items-center gap-6 text-xs font-light">
            <a
              href="#"
              className="text-gray-500 hover:text-[#B5A65F] transition-colors"
            >
              Chính Sách Bảo Mật
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-[#B5A65F] transition-colors"
            >
              Điều Khoản Sử Dụng
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-[#B5A65F] transition-colors"
            >
              Cookies
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
