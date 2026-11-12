import { dictionaries, type CopyKey, type Language } from "../i18n";

function copyKey(value: string | undefined): CopyKey {
  if (!value || !Object.hasOwn(dictionaries.en, value)) {
    throw new Error(`Unknown translation key: ${value}`);
  }
  return value as CopyKey;
}

export function bindTranslations(root: ParentNode): (language: Language) => void {
  const text = Array.from(root.querySelectorAll<HTMLElement>("[data-i18n]"), element => ({
    element,
    key: copyKey(element.dataset.i18n),
  }));
  const labels = Array.from(root.querySelectorAll<HTMLElement>("[data-i18n-aria-label]"), element => ({
    element,
    key: copyKey(element.dataset.i18nAriaLabel),
  }));
  const dates = Array.from(root.querySelectorAll<HTMLTimeElement>("time[data-date]"), element => ({
    element,
    date: new Date(`${element.dateTime}T00:00:00Z`),
  }));

  return language => {
    const dictionary = dictionaries[language];
    for (const { element, key } of text) element.textContent = dictionary[key];
    for (const { element, key } of labels) element.setAttribute("aria-label", dictionary[key]);
    const formatter = new Intl.DateTimeFormat(language, { dateStyle: "medium", timeZone: "UTC" });
    for (const { element, date } of dates) element.textContent = formatter.format(date);
  };
}
