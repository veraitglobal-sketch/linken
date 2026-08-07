import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

/**
 * Static accessibility / a11y-foundation checks (no browser).
 * npm run test:a11y:static
 */

const root = join(import.meta.dirname, "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

test("shared SkipLink exists and marketing shell uses it", () => {
  const skip = read("src/components/a11y/skip-link.tsx");
  assert.match(skip, /Skip to content/);
  assert.match(skip, /#main-content/);
  const shell = read("src/components/layout/page-shell.tsx");
  assert.match(shell, /SkipLink/);
  assert.match(shell, /id="main-content"/);
});

test("workspace and confirm shells expose main landmarks + skip", () => {
  const workspace = read("src/components/dashboard/workspace-shell.tsx");
  assert.match(workspace, /SkipLink/);
  assert.match(workspace, /id="main-content"/);
  const confirm = read("src/app/(confirm)/layout.tsx");
  assert.match(confirm, /SkipLink/);
  assert.match(confirm, /id="main-content"/);
});

test("focus trap hook supports Escape and Tab cycling", () => {
  const trap = read("src/components/a11y/use-focus-trap.ts");
  assert.match(trap, /Escape/);
  assert.match(trap, /Tab/);
  assert.match(trap, /previous\.current/);
});

test("globals gate smooth scroll and motion for reduced-motion", () => {
  const css = read("src/app/globals.css");
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /scroll-behavior:\s*auto/);
  assert.match(css, /:focus-visible/);
});

test("plus token meets AA target on paper (not decorative-only gray)", () => {
  const css = read("src/app/globals.css");
  assert.match(css, /--plus:\s*#5f6964/);
});

test("project request form uses visible labels", () => {
  const form = read("src/components/project-requests/request-form.tsx");
  assert.match(form, /htmlFor=/);
  assert.match(form, /label htmlFor/);
  assert.doesNotMatch(
    form,
    /<Input name="title"[^>]*placeholder="What do you need\?"/,
  );
});

test("login errors use live region / alert", () => {
  const login = read("src/components/auth/login-panel.tsx");
  assert.match(login, /StatusMessage/);
  assert.match(login, /autoComplete/);
  const tab = read("src/components/auth/login-mode-tab.tsx");
  assert.match(tab, /aria-selected/);
});
