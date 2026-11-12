import { requireElement } from "../browser/dom";

export function bindDisclosure(root: HTMLElement, trigger: HTMLButtonElement): (open: boolean) => void {
  const panelId = trigger.getAttribute("aria-controls");
  if (!panelId) throw new Error("Disclosure trigger is missing aria-controls");
  const panel = requireElement(root, `#${CSS.escape(panelId)}`);

  return open => {
    trigger.setAttribute("aria-expanded", String(open));
    panel.dataset.open = String(open);
    panel.inert = !open;
    panel.setAttribute("aria-hidden", String(!open));
  };
}
