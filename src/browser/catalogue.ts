import type { ClientPrompt, Tag } from "../catalogue";
import { bindPromptCard } from "../components/prompt-card";
import { agentInstructions, dictionaries, promptCount, type CopyKey, type Language } from "../i18n";
import { defaultLanguage, isLanguage } from "../i18n/languages";
import { requireElement } from "./dom";
import { bindTranslations } from "./localization";

const data = requireElement<HTMLScriptElement>(document, "script#catalogue-data");
const prompts: ClientPrompt[] = JSON.parse(data.textContent ?? "");
const languageKey = "sidequest-language";

function savedLanguage(): Language {
  try {
    const saved = localStorage.getItem(languageKey);
    return isLanguage(saved) ? saved : defaultLanguage;
  } catch {
    return defaultLanguage;
  }
}

let language = savedLanguage();
const translate = bindTranslations(document);
const description = requireElement<HTMLMetaElement>(document, 'meta[name="description"]');
const router = requireElement(document, "#agent-router");
const llmsPath = router.dataset.llmsPath;
if (!llmsPath) throw new Error("Agent instructions are missing data-llms-path");
const llmsUrl = new URL(llmsPath, location.origin).href;
const count = requireElement(document, "#prompt-count");
const toastElement = requireElement(document, "#toast");
let toastTimeout: ReturnType<typeof setTimeout> | undefined;

function toast(message: string): void {
  clearTimeout(toastTimeout);
  toastElement.textContent = message;
  toastElement.classList.add("visible");
  toastTimeout = setTimeout(() => toastElement.classList.remove("visible"), 2200);
}

async function copyText(text: string, message: CopyKey): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast(dictionaries[language][message]);
  } catch {
    toast(dictionaries[language].clipboardFailed);
  }
}

const cards = prompts.map(prompt => bindPromptCard(
  requireElement(document, `[data-prompt-id="${prompt.id}"]`), prompt, copyText,
));
const languageButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("button[data-language]"), button => {
  const value = button.dataset.language;
  if (!isLanguage(value)) throw new Error(`Unknown interface language: ${value}`);
  button.addEventListener("click", () => {
    setLanguage(value);
    try { localStorage.setItem(languageKey, value); }
    catch {}
  });
  return { button, value };
});

function setLanguage(next: Language): void {
  language = next;
  const t = dictionaries[language];
  document.documentElement.lang = language;
  document.title = t.pageTitle;
  description.content = t.intro;
  translate(language);
  for (const { button, value } of languageButtons) button.setAttribute("aria-pressed", String(value === language));
  router.textContent = agentInstructions(llmsUrl, language);
  router.lang = language;
  count.textContent = promptCount(prompts.length, language);
  for (const card of cards) card.setLanguage(language);
}

let activeTag: Tag | "all" = "all";
const tags = prompts.flatMap(prompt => prompt.tags);
function isFilter(value: string | undefined): value is Tag | "all" {
  return value === "all" || tags.some(tag => tag === value);
}
const tagButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("button[data-tag]"), button => {
  const value = button.dataset.tag;
  if (!isFilter(value)) throw new Error(`Unknown catalogue filter: ${value}`);
  button.addEventListener("click", () => setFilter(activeTag === value ? "all" : value));
  return { button, value };
});

function setFilter(tag: Tag | "all"): void {
  activeTag = tag;
  for (const { button, value } of tagButtons) button.setAttribute("aria-pressed", String(value === tag));
  for (const card of cards) card.setFilter(tag);
}

requireElement<HTMLButtonElement>(document, "button[data-copy-agent]").addEventListener("click", () => {
  void copyText(router.textContent ?? "", "agentCopied");
});
setLanguage(language);
