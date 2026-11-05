import type { Ref } from "vue";

const FOCUSABLE = [
  "a[href]",
  "button:not(:disabled)",
  "input:not(:disabled)",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useFocusTrap(container: Readonly<Ref<HTMLElement | null>>) {
  function getFocusable(): HTMLElement[] {
    const el = container.value;
    if (!el) return [];
    return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (node) => node.getClientRects().length > 0,
    );
  }

  function focusInitial() {
    const el = container.value;
    if (!el) return;
    const target = el.querySelector<HTMLElement>("[data-autofocus]") ?? getFocusable()[0] ?? el;
    target.focus();
  }

  function handleTab(event: KeyboardEvent) {
    const el = container.value;
    if (!el) return;

    const items = getFocusable();
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) {
      event.preventDefault();
      el.focus();
      return;
    }

    const active = document.activeElement;
    const outside = !el.contains(active);
    if (event.shiftKey && (active === first || outside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || outside)) {
      event.preventDefault();
      first.focus();
    }
  }

  return { focusInitial, handleTab };
}
