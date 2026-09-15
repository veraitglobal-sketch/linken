"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "hansala_nav_collapsed";
const EVENT = "hansala:nav-collapsed";

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Workspace sidebar: open with labels by default, collapsible to an icon rail.
 * The top-bar toggle and the aside share this one remembered value.
 */
export function useNavCollapsed() {
  const collapsed = useSyncExternalStore(subscribe, read, () => false);
  const toggle = useCallback(() => {
    try {
      window.localStorage.setItem(KEY, read() ? "0" : "1");
    } catch {
      /* storage blocked — the toggle still works for this page view below */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { collapsed, toggle };
}
