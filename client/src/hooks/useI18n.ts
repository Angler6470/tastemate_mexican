import { useState, useEffect } from "react";
import enTranslations from "../locales/en.json";
import esTranslations from "../locales/es.json";

type Language = "en" | "es";
type TranslationKey = string;

const translations = {
  en: enTranslations,
  es: esTranslations,
};

export function useI18n() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: TranslationKey): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return value;
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return {
    language,
    t,
    changeLanguage,
  };
}
