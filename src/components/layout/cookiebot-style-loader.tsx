"use client";

import { useEffect } from "react";
import { COOKIEBOT_OVERRIDE_CSS } from "@/lib/cookiebot-styles";

const STYLE_ID = "hansala-cookiebot-overrides";

const DIALOG_PIN: Record<string, string> = {
  position: "fixed",
  top: "50%",
  left: "50%",
  right: "auto",
  bottom: "auto",
  transform: "translate(-50%, -50%)",
  width: "32.5rem",
  "max-width": "calc(100vw - 32px)",
  margin: "0",
};

function injectOverrides() {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = COOKIEBOT_OVERRIDE_CSS;
    document.head.appendChild(style);
    return;
  }
  if (style.textContent !== COOKIEBOT_OVERRIDE_CSS) {
    style.textContent = COOKIEBOT_OVERRIDE_CSS;
  }
  if (document.head.lastElementChild !== style) {
    document.head.appendChild(style);
  }
}

function pinDialogs() {
  for (const id of ["CybotCookiebotDialog", "CybotCookiebotDialogDetail"]) {
    const el = document.getElementById(id);
    if (!el) continue;
    for (const [prop, value] of Object.entries(DIALOG_PIN)) {
      el.style.setProperty(prop, value, "important");
    }
  }
}

export function CookiebotStyleLoader() {
  useEffect(() => {
    let busy = false;
    const run = () => {
      if (busy) return;
      busy = true;
      injectOverrides();
      pinDialogs();
      queueMicrotask(() => {
        busy = false;
      });
    };

    run();
    const head = new MutationObserver(run);
    head.observe(document.head, { childList: true });
    const body = new MutationObserver(run);
    body.observe(document.body, { childList: true });
    window.addEventListener("CookiebotOnLoad", run);
    window.addEventListener("CookiebotOnDialogDisplay", run);

    return () => {
      head.disconnect();
      body.disconnect();
      window.removeEventListener("CookiebotOnLoad", run);
      window.removeEventListener("CookiebotOnDialogDisplay", run);
    };
  }, []);

  return null;
}
