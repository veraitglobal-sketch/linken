"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus trap + Escape for modal dialogs (WCAG 2.1.2 / 2.4.3).
 * Restores focus to the previously focused element on cleanup.
 */
export function useFocusTrap(
  active: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement | null>,
) {
  const previous = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    previous.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (!panel) return;

    const nodes = () =>
      [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
      );

    const first = nodes()[0];
    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const list = nodes();
      if (list.length === 0) return;
      const head = list[0];
      const tail = list[list.length - 1];
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault();
        head.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previous.current?.focus?.();
    };
  }, [active, onClose, panelRef]);
}
