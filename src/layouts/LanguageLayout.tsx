import { useEffect } from "react";
import { Outlet, useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SUPPORTED_LANGUAGES = ["vi", "en"];
const DEFAULT_LANGUAGE = "vi";

const LanguageLayout = () => {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  const currentLang = lang || DEFAULT_LANGUAGE;

  useEffect(() => {
    if (i18n.changeLanguage && i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
      localStorage.setItem("i18nextLng", currentLang);
    }
  }, [currentLang, i18n]);

  if (lang && !SUPPORTED_LANGUAGES.includes(lang)) {
    return <Navigate to={`/${DEFAULT_LANGUAGE}`} replace />;
  }

  return <Outlet />;
};

export default LanguageLayout;
