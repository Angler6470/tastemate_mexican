import React, { createContext, useContext, useState, useEffect } from "react";
import enTranslations from "../locales/en.json";
import esTranslations from "../locales/es.json";

type Language = "en" | "es";
type TranslationKey = string;

const translations = {
  en: enTranslations,
  es: esTranslations,
};

type LanguageContextType = {
  language: Language;
  t: (key: TranslationKey) => string;
  changeLanguage: (newLanguage: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
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
    console.log(`Language changing from ${language} to ${newLanguage}`);
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}