import { useEffect } from "react";

function getFocusable(root) {
  if (!root) return [];
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");
  return Array.from(root.querySelectorAll(selector)).filter(
    (el) => el.offsetParent !== null || el.getClientRects().length
  );
}

export function useFocusTrap(isOpen, containerRef, onEscape) {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const id = requestAnimationFrame(() => {
      const focusables = getFocusable(containerRef.current);
      if (focusables.length) focusables[0].focus();
      else containerRef.current?.focus();
    });

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = getFocusable(containerRef.current);
      if (!focusables.length) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const node = containerRef.current;
    node?.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = originalOverflow || "";
      node?.removeEventListener("keydown", onKeyDown);
      if (prev && prev.focus) prev.focus();
    };
  }, [isOpen, containerRef, onEscape]);
}
