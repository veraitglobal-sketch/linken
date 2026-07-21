"use client";

import { useState } from "react";
import {
  WORKSPACE_SECTION_LABELS,
  WORKSPACE_SECTIONS,
  type WorkspaceSection,
} from "@/features/workspace/sections";
import { cn } from "@/lib/cn";

type Props = {
  defaultPermissions?: WorkspaceSection[];
  visible: boolean;
};

export function SectionPermissionsFields({
  defaultPermissions = [],
  visible,
}: Props) {
  const [selected, setSelected] =
    useState<WorkspaceSection[]>(defaultPermissions);

  if (!visible) return null;

  function toggle(key: WorkspaceSection) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );
  }

  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-1.5 text-[12px] font-medium text-ink">
        Section access
      </legend>
      <p className="mb-2.5 text-[11px] text-muted">
        Sections this member can open.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {WORKSPACE_SECTIONS.map((key) => {
          const on = selected.includes(key);
          return (
            <label key={key} className="cursor-pointer">
              <input
                type="checkbox"
                name="permissions"
                value={key}
                checked={on}
                onChange={() => toggle(key)}
                className="sr-only"
              />
              <span
                className={cn(
                  "inline-flex h-8 items-center rounded-lg border px-2.5 text-[11px] font-semibold transition-colors",
                  on
                    ? "border-navy/25 bg-navy/[0.08] text-ink"
                    : "border-line bg-paper text-muted hover:border-ink/20 hover:text-ink",
                )}
              >
                {WORKSPACE_SECTION_LABELS[key]}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
