import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { enGB, fr, sv } from "date-fns/locale";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, resolveLanguage, translate, type Language, type MessageKey } from "@/lib/i18n";

const dateLocales = { en: enGB, sv, fr };
type LanguageApi = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
  dateLocale: typeof enGB;
};
const LanguageContext = createContext<LanguageApi | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setLanguage(resolveLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY))); } catch { /* Use English if storage is unavailable. */ }
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY) setLanguage(resolveLanguage(event.newValue));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = language;
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* Selection still works for this session. */ }
  }, [language, ready]);
  return <LanguageContext.Provider value={{ language, setLanguage, dateLocale: dateLocales[language], t: (key, values) => translate(language, key, values) }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("LanguageProvider is required");
  return context;
}