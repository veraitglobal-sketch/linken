"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { filterServiceSuggestions } from "@/data/service-suggestions";
import { cn } from "@/lib/cn";

type Props = {
  name?: string;
  defaultServices?: string[];
};

/** Same suggestion catalog for every company — typeahead as you type. */
export function ServicesTagInput({
  name = "services",
  defaultServices = [],
}: Props) {
  const [tags, setTags] = useState(() =>
    Array.isArray(defaultServices) ? defaultServices : [],
  );
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const suggestions = useMemo(
    () => filterServiceSuggestions(draft, tags),
    [draft, tags],
  );

  function addTag(raw: string) {
    const next = raw.trim();
    if (!next) return;
    setTags((prev) => {
      if (prev.some((x) => x.toLowerCase() === next.toLowerCase())) return prev;
      return [...prev, next].slice(0, 40);
    });
    setDraft("");
    setOpen(false);
    setActive(0);
  }

  function commitDraft() {
    if (open && suggestions[active]) {
      addTag(suggestions[active]!);
      return;
    }
    draft
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach(addTag);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % suggestions.length);
      return;
    }
    if (e.key === "ArrowUp" && suggestions.length > 0) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
      return;
    }
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Backspace" && !draft && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={tags.join(", ")} />
      <div
        className={cn(
          "flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border border-line bg-paper px-2.5 py-2",
          "focus-within:border-blue focus-within:bg-surface focus-within:ring-2 focus-within:ring-[rgba(26,92,81,0.12)]",
        )}
      >
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
            className="inline-flex h-7 items-center gap-1 rounded-lg bg-surface px-2 text-[12px] font-medium text-ink ring-1 ring-line"
          >
            {tag}
            <span aria-hidden className="text-plus">
              ×
            </span>
          </button>
        ))}
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120);
          }}
          placeholder={
            tags.length ? "Type to add…" : "e.g. IT services, Architecture"
          }
          className="min-w-[10rem] flex-1 bg-transparent px-1 py-1 text-sm text-ink outline-none placeholder:text-muted"
          aria-label="Add service"
          autoComplete="off"
        />
      </div>

      {open && suggestions.length > 0 ? (
        <ul
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-line bg-surface py-1 shadow-[0_12px_32px_rgba(8,20,18,0.1)]"
        >
          {suggestions.map((s, i) => (
            <li key={s} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(s)}
                className={cn(
                  "flex w-full px-3 py-2 text-left text-[13px] text-ink",
                  i === active ? "bg-accent-soft font-medium" : "hover:bg-paper",
                )}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-1.5 text-[11px] text-muted">
        Same suggestions for every company. Type to filter — pick or press Enter.
      </p>
    </div>
  );
}
