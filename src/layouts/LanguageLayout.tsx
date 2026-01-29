import { useEffect } from "react";
import { Outlet, useParams, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SUPPORTED_LANGUAGES = ["vi", "en"];
const DEFAULT_LANGUAGE = "vi";

const LanguageLayout = () => {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const location = useLocation();

  const currentLang = lang || DEFAULT_LANGUAGE;

  useEffect(() => {
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
      localStorage.setItem("i18nextLng", currentLang);

      document.documentElement.lang = currentLang;
    }
  }, [currentLang, i18n]);

  if (lang && !SUPPORTED_LANGUAGES.includes(lang)) {
    const newPath = location.pathname.replace(
      /^\/[^/]+/,
      `/${DEFAULT_LANGUAGE}`,
    );
    return <Navigate to={newPath} replace />;
  }

  return <Outlet />;
};

export default LanguageLayout;
