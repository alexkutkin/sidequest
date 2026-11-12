export function setDisclosure(element: HTMLElement | null, open: boolean): void {
  if (!element) return;
  element.dataset.open = String(open);
  element.inert = !open;
  element.setAttribute("aria-hidden", String(!open));
}
