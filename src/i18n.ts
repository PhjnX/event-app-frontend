import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationVI from "./locales/vi/translation.json";
import translationEN from "./locales/en/translation.json";

export const resources = {
  vi: {
    translation: translationVI,
  },
  en: {
    translation: translationEN,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "vi",
    lng: "vi",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
