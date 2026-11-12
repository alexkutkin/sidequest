export const languages = ["en", "ru"] as const;
export type Language = (typeof languages)[number];
export const defaultLanguage: Language = "en";

export function isLanguage(value: unknown): value is Language {
  return languages.some(language => language === value);
}
