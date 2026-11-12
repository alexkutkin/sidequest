import { en, type Dictionary } from "./en";
import { ru } from "./ru";

export type Language = "en" | "ru";
export type CopyKey = keyof Dictionary;
export const dictionaries: Record<Language, Dictionary> = { en, ru };

export function promptCount(count: number, language: Language): string {
  const rule = new Intl.PluralRules(language).select(count);
  const key = rule === "one" ? "countOne" : rule === "few" ? "countFew" : "count";
  return dictionaries[language][key].replace("{count}", String(count));
}
