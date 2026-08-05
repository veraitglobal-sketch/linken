"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TestimonialsLayoutControls } from "@/components/widgets/testimonials-layout-controls";
import { TestimonialsThemeControls } from "@/components/widgets/testimonials-theme-controls";
import { TestimonialsStudioRow } from "@/components/widgets/testimonials-studio-row";
import type { TestimonialLayout } from "@/features/testimonials/settings";
import type { TestimonialStudioEntry } from "@/features/testimonials/queries";
import type { TestimonialThemeTokens } from "@/features/testimonials/theme/presets";
import { layoutFitWarnings } from "@/features/testimonials/theme/layout-fit";
import { saveTestimonialOrder } from "@/features/testimonials/testimonials-studio-actions";

type Props = {
  entries: TestimonialStudioEntry[];
  layout: TestimonialLayout;
  limit: number;
  theme: TestimonialThemeTokens;
};

export function TestimonialsStudio({ entries: initial, layout, limit, theme }: Props) {
  return (
    <TestimonialsStudioInner
      key={studioKey(initial, layout, limit, theme.preset)}
      entries={initial}
      layout={layout}
      limit={limit}
      theme={theme}
    />
  );
}

function studioKey(
  entries: TestimonialStudioEntry[],
  layout: TestimonialLayout,
  limit: number,
  preset: string,
) {
  return [
    layout,
    limit,
    preset,
    ...entries.map(
      (e) => `${e.id}:${e.included ? 1 : 0}:${e.belowCut ? 1 : 0}`,
    ),
  ].join("|");
}

function TestimonialsStudioInner({ entries: initial, layout, limit, theme }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const includedCount = rows.filter((r) => r.included).length;
  const warnings = layoutFitWarnings(rows, layout);

  function onDragStart(id: string) {
    setDragId(id);
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const next = [...rows];
    const from = next.findIndex((r) => r.id === dragId);
    const to = next.findIndex((r) => r.id === targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      return;
    }
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    setRows(next);
    setDragId(null);
    startTransition(async () => {
      await saveTestimonialOrder(next.map((r) => r.id));
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-surface">
      <div className="border-b border-line px-5 py-4">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
          Testimonials studio
        </p>
        <p className="mt-1 max-w-2xl text-[13px] text-muted">
          Client-written words only — you cannot edit their text. New published
          testimonials appear automatically; uncheck to hide or drag to reorder.
        </p>
        <TestimonialsLayoutControls
          layout={layout}
          limit={limit}
          includedCount={includedCount}
          totalCount={rows.length}
        />
        <TestimonialsThemeControls theme={theme} />
        {warnings.length ? (
          <ul className="mt-3 space-y-1">
            {warnings.map((w) => (
              <li key={w} className="text-[12px] text-ember">
                {w}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-8 text-[13px] text-muted">
          No published testimonials yet. Use the Invite form above, or collect one
          after a client confirms a partnership, project, or reference.
        </p>
      ) : (
        <ul className={`divide-y divide-line ${pending ? "opacity-70" : ""}`}>
          {rows.map((entry) => (
            <TestimonialsStudioRow
              key={entry.id}
              entry={entry}
              onDragStart={() => onDragStart(entry.id)}
              onDrop={() => onDrop(entry.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
