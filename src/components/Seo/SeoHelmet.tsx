// src/components/Seo/SeoHelmet.tsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useCurrentLang, DEFAULT_LANG } from "@/utils/i18n-router";

interface SeoHelmetProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  slug?: string;
}

const DOMAIN = "https://ems.webie.com.vn";

export const SeoHelmet: React.FC<SeoHelmetProps> = ({
  title,
  description,
  keywords,
  image = `${DOMAIN}/og-image-preview.png`,
  slug = "",
}) => {
  const lang = useCurrentLang();
  const location = useLocation();

  const path = slug || location.pathname || "";
  const cleanSlug = path.startsWith("/") ? path.substring(1) : path;

  const buildUrl = (langCode: string) => {
    if (langCode === DEFAULT_LANG) {
      return cleanSlug ? `${DOMAIN}/${cleanSlug}` : `${DOMAIN}/`;
    }
    return cleanSlug ? `${DOMAIN}/${langCode}/${cleanSlug}` : `${DOMAIN}/${langCode}`;
  };

  const currentUrl = buildUrl(lang);
  const alternateVi = buildUrl("vi");
  const alternateEn = buildUrl("en");

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>

      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      <link rel="canonical" href={currentUrl} />

      <link rel="alternate" hrefLang="vi" href={alternateVi} />
      <link rel="alternate" hrefLang="en" href={alternateEn} />
      <link rel="alternate" hrefLang="x-default" href={alternateVi} />

      <meta property="og:locale" content={lang === "vi" ? "vi_VN" : "en_US"} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Webie EMS" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SeoHelmet;
