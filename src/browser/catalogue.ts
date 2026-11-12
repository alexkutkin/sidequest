import type { PromptView, Tag } from "../catalogue";
import { dictionaries, promptCount, type CopyKey, type Language } from "../i18n";
import { setDisclosure } from "./disclosure";

const data = document.getElementById("catalogue-data");
const prompts: PromptView[] = JSON.parse(data?.textContent ?? "[]");
const languageKey = "sidequest-language";

function savedLanguage(): Language {
  try { return localStorage.getItem(languageKey) === "ru" ? "ru" : "en"; }
  catch { return "en"; }
}

type ReadingLevel = "collapsed" | "summary" | "full";
const state: { language: Language; reading: Map<string, ReadingLevel>; tag: Tag | "all" } = {
  language: savedLanguage(),
  reading: new Map<string, ReadingLevel>(prompts.map(prompt => [prompt.id, "collapsed"])),
  tag: "all",
};

function isCopyKey(value: string): value is CopyKey {
  return value in dictionaries.en;
}

type ContentKey = keyof PromptView["content"]["en"];
function isContentKey(value: string): value is ContentKey {
  return value === "title" || value === "description" || value === "summary" || value === "outcome";
}

function refresh(): void {
  const t = dictionaries[state.language];
  document.documentElement.lang = state.language;
  document.title = t.pageTitle;
  document.querySelector('meta[name="description"]')?.setAttribute("content", t.intro);

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    if (key && isCopyKey(key)) element.textContent = t[key];
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-aria-label]").forEach(element => {
    const key = element.dataset.i18nAriaLabel;
    if (key && isCopyKey(key)) element.setAttribute("aria-label", t[key]);
  });
  document.querySelectorAll<HTMLButtonElement>("[data-language]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
  });
  document.querySelectorAll<HTMLButtonElement>("[data-tag]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.tag === state.tag));
  });
  document.querySelectorAll<HTMLTimeElement>("time[data-date]").forEach(element => {
    element.textContent = new Intl.DateTimeFormat(state.language, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${element.dateTime}T00:00:00Z`));
  });

  const router = document.querySelector<HTMLElement>(".agent-router");
  if (router?.dataset.llmsPath) {
    router.textContent = t.router.replace("{url}", new URL(router.dataset.llmsPath, location.origin).href);
    router.lang = state.language;
  }
  const count = document.querySelector(".prompt-count");
  if (count) count.textContent = promptCount(prompts.length, state.language);

  document.querySelectorAll<HTMLElement>("[data-prompt-id]").forEach(card => {
    const prompt = prompts.find(entry => entry.id === card.dataset.promptId);
    if (!prompt) return;
    const content = prompt.content[state.language];
    const level = state.reading.get(prompt.id) ?? "collapsed";
    const open = level !== "collapsed";
    const full = level === "full";
    card.hidden = state.tag !== "all" && !prompt.tags.includes(state.tag);
    card.classList.toggle("is-open", open);
    card.querySelectorAll<HTMLElement>("[data-content]").forEach(element => {
      const key = element.dataset.content;
      if (key && isContentKey(key)) element.textContent = content[key];
    });
    const expand = card.querySelector<HTMLButtonElement>("[data-expand]");
    expand?.setAttribute("aria-expanded", String(open));
    expand?.setAttribute("aria-label", `${open ? t.hideSummary : t.readSummary}: ${content.title}`);
    const summaryLabel = card.querySelector("[data-summary-label]");
    if (summaryLabel) summaryLabel.textContent = open ? t.hideSummary : t.readSummary;
    setDisclosure(document.getElementById(`summary-${prompt.id}`), open);
    const closedIcon = card.querySelector<HTMLElement>("[data-closed-icon]");
    if (closedIcon) closedIcon.hidden = open;
    const openIcon = card.querySelector<HTMLElement>("[data-open-icon]");
    if (openIcon) openIcon.hidden = !open;
    card.querySelector("[data-full]")?.setAttribute("aria-expanded", String(full));
    const fullLabel = card.querySelector("[data-full-label]");
    if (fullLabel) fullLabel.textContent = full ? t.hideFull : t.fullPrompt;
    setDisclosure(document.getElementById(`full-${prompt.id}`), full);
  });
}

let toastTimeout: ReturnType<typeof setTimeout> | undefined;
function toast(message: string): void {
  clearTimeout(toastTimeout);
  const element = document.getElementById("toast");
  if (!element) return;
  element.textContent = message;
  element.classList.add("visible");
  toastTimeout = setTimeout(() => element.classList.remove("visible"), 2200);
}

async function copyText(text: string, message: CopyKey): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast(dictionaries[state.language][message]);
  } catch {
    toast(dictionaries[state.language].clipboardFailed);
  }
}

document.addEventListener("click", event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>("button");
  if (!button) return;

  const language = button.dataset.language;
  if (language === "en" || language === "ru") {
    state.language = language;
    try { localStorage.setItem(languageKey, language); }
    catch { /* The current language still works when storage is unavailable. */ }
    refresh();
  }

  const tag = button.dataset.tag;
  if (tag === "all" || prompts.some(prompt => prompt.tags.some(value => value === tag))) {
    const nextTag = tag as Tag | "all";
    state.tag = state.tag === nextTag ? "all" : nextTag;
    refresh();
  }

  const expand = button.dataset.expand;
  if (expand && state.reading.has(expand)) {
    state.reading.set(expand, state.reading.get(expand) === "collapsed" ? "summary" : "collapsed");
    refresh();
  }
  const full = button.dataset.full;
  const fullLevel = full ? state.reading.get(full) : undefined;
  if (full && (fullLevel === "summary" || fullLevel === "full")) {
    state.reading.set(full, fullLevel === "full" ? "summary" : "full");
    refresh();
  }

  const copyPrompt = button.dataset.copyPrompt;
  if (copyPrompt) {
    const text = document.getElementById(`text-${copyPrompt}`)?.textContent;
    if (text !== undefined && text !== null) void copyText(text, "promptCopied");
  }
  const copyLink = button.dataset.copyLink;
  if (copyLink) {
    const prompt = prompts.find(entry => entry.id === copyLink);
    if (prompt) void copyText(new URL(prompt.rawPath, location.origin).href, "linkCopied");
  }
  if (button.hasAttribute("data-copy-agent")) {
    const instructions = document.querySelector(".agent-router")?.textContent;
    if (instructions) void copyText(instructions, "agentCopied");
  }
});

refresh();
