import { en, type Dictionary } from "./en";
import { ru } from "./ru";
import { defaultLanguage, type Language } from "./languages";

export type { Language } from "./languages";
export type CopyKey = keyof Dictionary;
export const dictionaries: Record<Language, Dictionary> = { en, ru };
export const defaultDictionary = dictionaries[defaultLanguage];

export function localizedLabel(key: CopyKey) {
  return { "aria-label": defaultDictionary[key], "data-i18n-aria-label": key };
}

export function agentInstructions(url: string, language: Language): string {
  return dictionaries[language].router.replace("{url}", url);
}

export function promptCount(count: number, language: Language): string {
  const rule = new Intl.PluralRules(language).select(count);
  const key = rule === "one" ? "countOne" : rule === "few" ? "countFew" : "count";
  return dictionaries[language][key].replace("{count}", String(count));
}
