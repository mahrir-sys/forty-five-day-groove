import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { translateChallengeNames } from "@/lib/challenge-names.functions";
import { displayChallengeName, NAME_CACHE_KEY, standardNameTranslations, type NameCache } from "@/lib/challenge-names";
import { enGB, fr, sv } from "date-fns/locale";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, resolveLanguage, translate, type Language, type MessageKey } from "@/lib/i18n";

const dateLocales = { en: enGB, sv, fr };
type LanguageApi = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
  dateLocale: typeof enGB;
  challengeName: (name: string) => string;
  registerNames: (names: string[]) => void;
  translating: boolean;
  translationError: string | null;
  retryTranslation: () => void;
};
const LanguageContext = createContext<LanguageApi | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);
  const [cache, setCache] = useState<NameCache>({});
  const [names, setNames] = useState<string[]>([]);
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const attempted = useRef(new Set<string>());
  const busy = useRef(false);
  const translateNames = useServerFn(translateChallengeNames);
  const registerNames = useCallback((incoming: string[]) => {
    setNames((previous) => incoming.every((name) => previous.includes(name)) ? previous : [...new Set([...previous, ...incoming])]);
  }, []);
  useEffect(() => {
    try { setLanguage(resolveLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY))); } catch { /* Use English if storage is unavailable. */ }
    try {
      const saved = JSON.parse(localStorage.getItem(NAME_CACHE_KEY) ?? "{}");
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        const valid: NameCache = {};
        for (const [name, row] of Object.entries(saved)) {
          if (row && typeof row === "object" && ["en", "sv", "fr"].every((key) => typeof (row as Record<string, unknown>)[key] === "string")) valid[name] = row as NameCache[string];
        }
        setCache(valid);
      }
    } catch { /* Invalid saved translations are regenerated. */ }
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
  useEffect(() => {
    if (ready) { try { localStorage.setItem(NAME_CACHE_KEY, JSON.stringify(cache)); } catch { /* Cache remains available for this session. */ } }
  }, [cache, ready]);
  useEffect(() => {
    if (!ready || busy.current) return;
    const missing = names.filter((name) => !standardNameTranslations(name) && !cache[name] && !attempted.current.has(name)).slice(0, 50);
    if (!missing.length) return;
    missing.forEach((name) => attempted.current.add(name));
    busy.current = true;
    setTranslating(true);
    setTranslationError(null);
    void translateNames({ data: { names: missing } }).then((result) => {
      if (result.error) setTranslationError(result.error);
      else setCache((previous) => ({ ...previous, ...result.translations }));
    }).catch(() => setTranslationError(translate(language, "translationFailed"))).finally(() => {
      busy.current = false;
      setTranslating(false);
    });
  }, [names, cache, ready, retry, translating, translateNames, language]);
  return <LanguageContext.Provider value={{ language, setLanguage, dateLocale: dateLocales[language], t: (key, values) => translate(language, key, values), challengeName: (name) => displayChallengeName(name, language, cache), registerNames, translating, translationError, retryTranslation: () => { attempted.current.clear(); setRetry((value) => value + 1); } }}>{children}</LanguageContext.Provider>;
}

export function useChallengeNames(names: string[]) {
  const { registerNames } = useLanguage();
  const signature = JSON.stringify(names);
  useEffect(() => { registerNames(JSON.parse(signature)); }, [signature, registerNames]);
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("LanguageProvider is required");
  return context;
}