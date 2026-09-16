"use client";

import { useMemo, useState } from "react";
import { CategoryBrowse } from "@/components/categories/category-browse";
import {
  CATEGORY_GROUPS,
  categoryBySlug,
} from "@/features/categories/taxonomy";
import { matchCategory } from "@/features/categories/match";
import { suggestCategories } from "@/features/categories/suggest";

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
  const [groupId, setGroupId] = useState<string | null>(null);

  const suggestions = useMemo(() => suggestCategories(text), [text]);

  const groupLeaves = useMemo(() => {
    if (!groupId) return [];
    const group = CATEGORY_GROUPS.find((g) => g.id === groupId);
    if (!group) return [];
    return group.slugs
      .map((s) => categoryBySlug(s))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [groupId]);

  const pick = (name: string, nextSlug: string) => {
    setText(name);
    setSlug(nextSlug);
    setOpen(false);
    setGroupId(null);
  };

  const picked = Boolean(slug) || Boolean(matchCategory(text));
  const showUnmatched = text.trim().length > 0 && !picked;
  const showBrowse = open && !text.trim();
  const showHits = open && suggestions.length > 0;

  return (
    <div className="relative">
      <input type="hidden" name="category_slug" value={slug} />
      <input
        name="category"
        value={text}
        required={required}
        maxLength={80}
        autoComplete="off"
        placeholder="Call center, IT software, cleaning…"
        className={className}
        onChange={(e) => {
          setText(e.target.value);
          setSlug("");
          setGroupId(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 140)}
      />
      {showBrowse ? (
        <CategoryBrowse
          groupId={groupId}
          groups={CATEGORY_GROUPS}
          leaves={groupLeaves}
          onOpenGroup={setGroupId}
          onBack={() => setGroupId(null)}
          onPick={pick}
        />
      ) : null}
      {showHits ? (
        <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-line bg-surface p-1 shadow-sm">
          {suggestions.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                className="w-full rounded-md px-3 py-2 text-left text-[14px] text-ink hover:bg-mute"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(c.name, c.slug)}
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
