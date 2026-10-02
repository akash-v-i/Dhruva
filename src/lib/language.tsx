import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "en" | "hi";
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (value: Language) => void;
}>({ language: "en", setLanguage: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    const saved = window.localStorage.getItem("dhruva-language");
    if (saved === "hi") setLanguage("hi");
  }, []);
  const updateLanguage = (value: Language) => {
    setLanguage(value);
    document.documentElement.lang = value;
    window.localStorage.setItem("dhruva-language", value);
  };
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
export function useHindi() {
  return useLanguage().language === "hi";
}
export function localize(english: string, hindi: string, isHindi: boolean) {
  return isHindi ? hindi : english;
}
