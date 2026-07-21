"use client";

import { useState } from "react";
import { updateCompanySlug } from "@/features/company/slug-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  slug: string;
  publicHost: string;
};

/** Public handle — editable like an @username, with a redirect from the old one. */
export function CompanySlugEditor({ slug, publicHost }: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3.5">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
        Handle
      </p>

      {!editing ? (
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[13px] text-ink">
            {publicHost}/c/
            <span className="font-mono font-semibold">{slug}</span>
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="mt-2">
          <form action={updateCompanySlug} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="current_slug" value={slug} />
            <label className="block min-w-0 flex-1 basis-48">
              <span className="mb-1 block text-[11px] text-muted">
                {publicHost}/c/
              </span>
              <Input
                name="slug"
                defaultValue={slug}
                required
                minLength={3}
                maxLength={60}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                title="Lowercase letters, numbers, and hyphens only"
                className="font-mono"
              />
            </label>
            <Button type="submit" variant="secondary" className="h-10 px-4">
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-10 px-4"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </form>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            Old QR codes, embeds, and links keep working — they redirect to
            your new handle automatically. Limited to once every 14 days.
          </p>
        </div>
      )}
    </div>
  );
}
