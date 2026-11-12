import type { ClientPrompt, Tag } from "../catalogue";
import { dictionaries, type CopyKey, type Language } from "../i18n";
import { defaultLanguage } from "../i18n/languages";
import { requireElement } from "../browser/dom";
import { bindDisclosure } from "./disclosure";

type ReadingLevel = "collapsed" | "summary" | "full";
type ContentKey = keyof ClientPrompt["content"][Language];
type CopyText = (text: string, message: CopyKey) => Promise<void>;

export function bindPromptCard(root: HTMLElement, prompt: ClientPrompt, copyText: CopyText) {
  const expand = requireElement<HTMLButtonElement>(root, "button[data-expand]");
  const full = requireElement<HTMLButtonElement>(root, "button[data-full]");
  const setSummaryOpen = bindDisclosure(root, expand);
  const setFullOpen = bindDisclosure(root, full);
  const summaryLabel = requireElement(root, "[data-summary-label]");
  const fullLabel = requireElement(root, "[data-full-label]");
  const closedIcon = requireElement(root, "[data-closed-icon]");
  const openIcon = requireElement(root, "[data-open-icon]");
  const text = requireElement<HTMLPreElement>(root, "pre[data-prompt-text]");
  const copyPrompt = requireElement<HTMLButtonElement>(root, "button[data-copy-prompt]");
  const copyLink = requireElement<HTMLButtonElement>(root, "button[data-copy-link]");
  const rawUrl = new URL(prompt.rawPath, location.origin).href;
  const content = (Object.keys(prompt.content[defaultLanguage]) as ContentKey[]).map(key => ({
    key,
    element: requireElement(root, `[data-content="${key}"]`),
  }));
  let language: Language = defaultLanguage;
  let level: ReadingLevel = "collapsed";

  function renderLabels(): void {
    const t = dictionaries[language];
    const summary = level === "collapsed" ? t.readSummary : t.hideSummary;
    expand.setAttribute("aria-label", `${summary}: ${prompt.content[language].title}`);
    summaryLabel.textContent = summary;
    fullLabel.textContent = level === "full" ? t.hideFull : t.fullPrompt;
  }

  function setLevel(next: ReadingLevel): void {
    level = next;
    const open = level !== "collapsed";
    root.classList.toggle("is-open", open);
    setSummaryOpen(open);
    setFullOpen(level === "full");
    closedIcon.hidden = open;
    openIcon.hidden = !open;
    renderLabels();
  }

  expand.addEventListener("click", () => setLevel(level === "collapsed" ? "summary" : "collapsed"));
  full.addEventListener("click", () => {
    if (level !== "collapsed") setLevel(level === "full" ? "summary" : "full");
  });
  copyPrompt.addEventListener("click", () => { void copyText(text.textContent ?? "", "promptCopied"); });
  copyLink.addEventListener("click", () => { void copyText(rawUrl, "linkCopied"); });

  return {
    setLanguage(next: Language): void {
      language = next;
      for (const { element, key } of content) element.textContent = prompt.content[language][key];
      renderLabels();
    },
    setFilter(tag: Tag | "all"): void {
      root.hidden = tag !== "all" && !prompt.tags.includes(tag);
    },
  };
}
