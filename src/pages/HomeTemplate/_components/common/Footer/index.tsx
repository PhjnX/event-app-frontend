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
import logoImage from "@/assets/images/Logo_EMS.png";

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

  const footerSections: FooterSectionData[] = [
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
        { label: "Về Chúng Tôi", path: "/about" },
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
    {
      id: "facebook",
      icon: <FaFacebookF />,
      url: "https://www.facebook.com/Webie.Vietnam",
    },
    { id: "twitter", icon: <FaTwitter />, url: "#" },
    {
      id: "linkedin",
      icon: <FaLinkedinIn />,
      url: "https://www.linkedin.com/company/webie-vietnam-co-ltd/",
    },
    {
      id: "instagram",
      icon: <FaInstagram />,
      url: "https://www.instagram.com/webievietnam/",
    },
    {
      id: "youtube",
      icon: <FaYoutube />,
      url: "https://www.youtube.com/@WebieVietnamProductionHouse",
    },
  ];

  return (
    <footer className="relative mt-auto text-white pt-20 pb-10 overflow-hidden font-noto bg-[#0a0a0a]">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0a]"></div>
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="footer-circuit"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M10,10 L90,10 M10,10 L10,90"
                stroke="white"
                strokeWidth="1"
                fill="none"
              />
              <circle cx="10" cy="10" r="2" fill="white" />
              <circle cx="90" cy="90" r="2" fill="white" />
              <path
                d="M50,50 L90,50 M50,50 L50,90"
                stroke="white"
                strokeWidth="1"
                fill="none"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#footer-circuit)" />
          </svg>
        </div>
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-[#0a0a0a] to-transparent z-10"></div>
        <motion.div
          animate={{ opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D8C97B] rounded-full blur-[150px] opacity-5 translate-y-[-50%]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900 rounded-full blur-[150px] opacity-10"
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 relative z-20">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
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
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-[400px] mx-auto lg:mx-0 font-light">
              Nền tảng quản lý sự kiện chuyên nghiệp, giúp bạn tổ chức và quản
              lý các sự kiện hiệu quả. Kết nối đam mê, kiến tạo tương lai.
            </p>
            <div className="flex gap-3 justify-center lg:justify-start">
              {socialLinks.map((social) => (
                <a
                  target="_blank"
                  key={social.id}
                  href={social.url}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 transition-all duration-300 hover:bg-[#D8C97B] hover:border-[#D8C97B] hover:text-black hover:-translate-y-1"
                >
                  <span className="text-sm">{social.icon}</span>
                </a>
              ))}
            </div>
          </motion.div>

          {footerSections.map((section) => (
            <motion.div
              key={section.id}
              className="flex flex-col"
              variants={itemVariants}
            >
              <h3 className="hidden lg:block text-sm font-bold mb-6 uppercase tracking-widest text-white border-b border-[#D8C97B]/30 pb-2 w-fit">
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
                    openSections[section.id] ? "rotate-180 text-[#D8C97B]" : ""
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
                      className="text-gray-400 text-sm no-underline transition-all duration-300 hover:text-[#D8C97B] hover:pl-2 inline-block font-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-5 text-center md:text-left relative z-20"
          variants={itemVariants}
        >
          <p className="text-gray-500 text-xs m-0 font-light">
            &copy; {currentYear}{" "}
            <span className="text-gray-300 font-medium">Webie Vietnam</span>.
            All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs font-light">
            <a
              href="#"
              className="text-gray-500 hover:text-[#D8C97B] transition-colors"
            >
              Chính Sách Bảo Mật
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-[#D8C97B] transition-colors"
            >
              Điều Khoản Sử Dụng
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-[#D8C97B] transition-colors"
            >
              Cookies
            </a>
          </div>
        </motion.div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&display=swap');
        .font-noto { font-family: 'Noto Serif', serif !important; }
      `}</style>
    </footer>
  );
}
