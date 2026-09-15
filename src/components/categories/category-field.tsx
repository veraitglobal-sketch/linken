"use client";

import { useMemo, useState } from "react";
import { CANONICAL_CATEGORIES } from "@/features/categories/taxonomy";
import { matchCategory } from "@/features/categories/match";

type Props = {
  defaultValue?: string;
  defaultSlug?: string | null;
  className?: string;
  required?: boolean;
};

export function CategoryField({
  defaultValue = "",
  defaultSlug = null,
  className,
  required,
}: Props) {
  const [text, setText] = useState(defaultValue);
  const [slug, setSlug] = useState(defaultSlug ?? "");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return CANONICAL_CATEGORIES.slice(0, 8);
    return CANONICAL_CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.includes(q.replace(/\s+/g, "-")),
    ).slice(0, 8);
  }, [text]);

  const picked = Boolean(slug) || Boolean(matchCategory(text));
  const showUnmatched = text.trim().length > 0 && !picked;

  return (
    <div className="relative">
      <input type="hidden" name="category_slug" value={slug} />
      <input
        name="category"
        value={text}
        required={required}
        maxLength={80}
        autoComplete="off"
        placeholder="Architecture, cleaning, software…"
        className={className}
        onChange={(e) => {
          setText(e.target.value);
          setSlug("");
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
      />
      {open && suggestions.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-line bg-surface p-1 shadow-sm">
          {suggestions.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                className="w-full rounded-md px-3 py-2 text-left text-[14px] text-ink hover:bg-mute"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setText(c.name);
                  setSlug(c.slug);
                  setOpen(false);
                }}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {showUnmatched ? (
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
          Saved. We add new categories as they come up.
        </p>
      ) : null}
    </div>
  );
}
