import React, { useState, useMemo } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaChevronDown,
} from "react-icons/fa";
import { motion, type Variants } from "framer-motion";
import logoImage from "@/assets/images/Logo_EMS.webp";
import { useTranslation } from "react-i18next";

interface FooterLink {
  label: string;
  path: string;
}

interface FooterSectionData {
  id: string;
  title: string;
  links: FooterLink[];
}

interface SocialLinkData {
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
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const DEFAULT_LANG = "vi";

export default function Footer() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const currentYear = new Date().getFullYear();

  const currentUrlLang = lang || DEFAULT_LANG;
  const homePath = currentUrlLang === DEFAULT_LANG ? "/" : `/${currentUrlLang}`;

  const getPath = (path: string) => {
    if (path === "") return homePath;
    if (path.startsWith("#") || path.startsWith("http")) return path;

    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `/${currentUrlLang}/${cleanPath}`;
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    quickLinks: false,
    support: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const footerSections: FooterSectionData[] = useMemo(
    () => [
      {
        id: "quickLinks",
        title: t("footer.sections.quick_links.title"),
        links: [
          { label: t("footer.sections.quick_links.items.home"), path: "" },
          {
            label: t("footer.sections.quick_links.items.about"),
            path: "about",
          },
          {
            label: t("footer.sections.quick_links.items.values"),
            path: "value",
          },
          {
            label: t("footer.sections.quick_links.items.events"),
            path: "events",
          },
          { label: t("footer.sections.quick_links.items.news"), path: "news" },
        ],
      },
      {
        id: "support",
        title: t("footer.sections.support.title"),
        links: [
          { label: t("footer.sections.support.items.help_center"), path: "#" },
          { label: t("footer.sections.support.items.docs"), path: "#" },
          { label: t("footer.sections.support.items.privacy"), path: "#" },
          { label: t("footer.sections.support.items.terms"), path: "#" },
        ],
      },
    ],
    [t],
  );

  const socialLinks: SocialLinkData[] = [
    {
      id: "facebook",
      icon: <FaFacebookF />,
      url: "https://www.facebook.com/Webie.Vietnam",
    },
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

  const getFooterLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm no-underline transition-all duration-300 inline-block font-light ${
      isActive
        ? "text-[#D8C97B] font-medium pl-2 border-l-2 border-[#D8C97B]"
        : "text-gray-400 hover:text-[#D8C97B] hover:pl-2 border-l-2 border-transparent"
    }`;

  return (
    <footer className="relative mt-auto text-white pt-20 pb-10 overflow-hidden font-noto bg-[#000000] selection:bg-[rgba(216,201,123,0.3)] border-t border-white/10">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        <div
          className="absolute bottom-0 left-0 w-full h-[150%] opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
            transform:
              "perspective(500px) rotateX(60deg) translateY(100px) scale(2)",
            transformOrigin: "bottom center",
            maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, transparent 100%)",
          }}
        />
        <div className="absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-black to-transparent"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 relative z-20">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div
            className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left"
            variants={itemVariants}
          >
            <Link
              to={homePath}
              className="mb-6 inline-block group"
              onClick={handleScrollToTop}
            >
              <img
                src={logoImage}
                alt="Webie Event"
                className="h-[50px] w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-[400px] mx-auto lg:mx-0 font-light">
              {t("footer.description")}
            </p>
            <div className="flex gap-3 justify-center lg:justify-start">
              {socialLinks.map((social) => (
                <a
                  target="_blank"
                  key={social.id}
                  href={social.url}
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-gray-400 transition-all duration-300 hover:bg-[#D8C97B] hover:border-[#D8C97B] hover:text-black hover:-translate-y-1"
                >
                  <span className="text-sm">{social.icon}</span>
                </a>
              ))}
            </div>
          </motion.div>

          <div className="hidden lg:block lg:col-span-1"></div>

          {footerSections.map((section) => (
            <motion.div
              key={section.id}
              className="lg:col-span-3 flex flex-col"
              variants={itemVariants}
            >
              <h3 className="hidden lg:block text-sm font-bold mb-6 uppercase tracking-widest text-white border-b border-[rgba(216,201,123,0.3)] pb-2 w-fit">
                {section.title}
              </h3>

              <button
                onClick={() => toggleSection(section.id)}
                className="lg:hidden w-full flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.1)] text-left bg-transparent"
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
                {section.links.map((link, index) => {
                  const isHashLink = link.path.startsWith("#");

                  if (isHashLink) {
                    return (
                      <li key={index}>
                        <a
                          href={link.path}
                          className="text-gray-400 text-sm no-underline transition-all duration-300 hover:text-[#D8C97B] hover:pl-2 inline-block font-light border-l-2 border-transparent"
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  }

                  const toPath = getPath(link.path);

                  return (
                    <li key={index}>
                      <NavLink
                        to={toPath}
                        end={link.path === ""}
                        className={getFooterLinkClass}
                        onClick={handleScrollToTop}
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="border-t border-[rgba(255,255,255,0.1)] pt-8 flex flex-col md:flex-row justify-between items-center gap-5 text-center md:text-left relative z-20"
          variants={itemVariants}
        >
          <p className="text-gray-500 text-xs m-0 font-light">
            &copy; {currentYear}{" "}
            <span className="text-gray-300 font-medium">Webie Vietnam</span>.{" "}
            {t("footer.bottom.rights")}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-light">
            <a
              href="#"
              className="text-gray-500 hover:text-[#D8C97B] transition-colors"
            >
              {t("footer.bottom.privacy")}
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-[#D8C97B] transition-colors"
            >
              {t("footer.bottom.terms")}
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-[#D8C97B] transition-colors"
            >
              {t("footer.bottom.cookies")}
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
