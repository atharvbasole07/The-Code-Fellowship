import { createContext, useContext, useMemo, useState } from "react";

const LanguageContext = createContext(null);
const LANGUAGE_STORAGE_KEY = "binwatch-language";

function getInitialLanguage() {
  if (typeof window === "undefined") return "en";
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return savedLanguage === "mr" ? "mr" : "en";
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);
  const isMarathi = language === "mr";

  function switchLanguage(nextLanguage) {
    const safeLanguage = nextLanguage === "mr" ? "mr" : "en";
    setLanguage(safeLanguage);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, safeLanguage);
    }
  }

  function toggleLanguage() {
    switchLanguage(isMarathi ? "en" : "mr");
  }

  function tr(englishText, marathiText) {
    return isMarathi ? marathiText : englishText;
  }

  const value = useMemo(
    () => ({ language, isMarathi, switchLanguage, toggleLanguage, tr }),
    [language, isMarathi]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
