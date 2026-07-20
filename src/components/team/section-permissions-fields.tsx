"use client";

import { useState } from "react";
import {
  WORKSPACE_SECTION_LABELS,
  WORKSPACE_SECTIONS,
  type WorkspaceSection,
} from "@/features/workspace/sections";

type Props = {
  defaultPermissions?: WorkspaceSection[];
  /** When false, fields are hidden (admin role selected). */
  visible: boolean;
};

export function SectionPermissionsFields({
  defaultPermissions = [],
  visible,
}: Props) {
  const [selected, setSelected] = useState<WorkspaceSection[]>(defaultPermissions);

  if (!visible) return null;

  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-2 text-[12px] font-medium text-ink">
        Section access
      </legend>
      <p className="mb-2 text-[11px] text-[#64748b]">
        Members only see selected workspace sections.
      </p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {WORKSPACE_SECTIONS.map((key) => {
          const checked = selected.includes(key);
          return (
            <label
              key={key}
              className="flex items-center gap-2 rounded-lg border border-[#e8eaee] bg-[#fafbfc] px-3 py-2 text-[12px] text-ink"
            >
              <input
                type="checkbox"
                name="permissions"
                value={key}
                checked={checked}
                onChange={(e) => {
                  setSelected((prev) =>
                    e.target.checked
                      ? [...prev, key]
                      : prev.filter((s) => s !== key),
                  );
                }}
                className="h-3.5 w-3.5 rounded border-line"
              />
              {WORKSPACE_SECTION_LABELS[key]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
