import { getSuggestions, LANGUAGES, type Language } from "./i18n";

export type NameTranslations = Record<Language, string>;
export type NameCache = Record<string, NameTranslations>;
export const NAME_CACHE_KEY = "challenge45:name-translations:v1";

export function standardNameTranslations(name: string): NameTranslations | undefined {
  const normalized = name.trim().toLocaleLowerCase();
  for (const language of LANGUAGES) {
    const index = getSuggestions(language).findIndex((item) => item.toLocaleLowerCase() === normalized);
    if (index < 0) continue;
    const en = getSuggestions("en")[index];
    const sv = getSuggestions("sv")[index];
    const fr = getSuggestions("fr")[index];
    if (en !== undefined && sv !== undefined && fr !== undefined) return { en, sv, fr };
  }
  return undefined;
}

export function displayChallengeName(name: string, language: Language, cache: NameCache): string {
  return standardNameTranslations(name)?.[language] ?? cache[name]?.[language] ?? name;
}

export function mergeNameTranslations(cache: NameCache, requested: string[], rows: Array<NameTranslations & { source: string }>): NameCache {
  const next = { ...cache };
  for (const row of rows) {
    if (!requested.includes(row.source) || LANGUAGES.some((language) => !row[language]?.trim() || row[language].length > 500)) continue;
    next[row.source] = { en: row.en.trim(), sv: row.sv.trim(), fr: row.fr.trim() };
  }
  return next;
}