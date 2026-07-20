"use client";

import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

type Props = {
  name?: string;
  defaultServices?: string[];
};

export function ServicesTagInput({
  name = "services",
  defaultServices = [],
}: Props) {
  const [tags, setTags] = useState(defaultServices);
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const next = raw
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (next.length === 0) return;
    setTags((prev) => {
      const merged = [...prev];
      for (const t of next) {
        if (!merged.some((x) => x.toLowerCase() === t.toLowerCase())) {
          merged.push(t);
        }
      }
      return merged.slice(0, 40);
    });
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={tags.join(", ")} />
      <div
        className={cn(
          "flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border border-line bg-[#f7f8fa] px-2.5 py-2",
          "focus-within:border-[#1a5c51] focus-within:bg-white focus-within:ring-2 focus-within:ring-[rgba(31,107,92,0.15)]",
        )}
      >
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
            className="inline-flex h-7 items-center gap-1 rounded-lg bg-white px-2 text-[12px] font-medium text-ink ring-1 ring-[#e8eaee]"
          >
            {tag}
            <span aria-hidden className="text-[#94a3b8]">
              ×
            </span>
          </button>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => commit(draft)}
          placeholder={tags.length ? "Add another…" : "e.g. Fit-out, MEP"}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-ink outline-none placeholder:text-muted"
          aria-label="Add service"
        />
      </div>
      <p className="mt-1.5 text-[11px] text-[#94a3b8]">
        Press Enter or comma to add. Click a tag to remove.
      </p>
    </div>
  );
}
