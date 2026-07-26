"use client";

import { useTransition } from "react";
import {
  LOGO_MOTION_OPTIONS,
  type LogoMotion,
  type LogoSize,
} from "@/features/widgets/catalog";
import {
  saveCasesPlacement,
  saveFooterPlacement,
  savePartnersPlacement,
} from "@/features/widgets/placement-studio-actions";

type Props = {
  partnersMotion: LogoMotion;
  partnersSize: LogoSize;
  partnersLimit: number;
  casesLimit: number;
  footerLimit: number;
};

const SIZES: LogoSize[] = ["sm", "md", "lg", "xl"];

const field =
  "mt-1.5 w-full rounded-lg border border-line bg-paper px-2.5 py-1.5 text-[13px]";

/** Compact controls for placement embed presets. */
export function PlacementStudioControls({
  partnersMotion,
  partnersSize,
  partnersLimit,
  casesLimit,
  footerLimit,
}: Props) {
  const [pending, start] = useTransition();

  return (
    <section className="rounded-2xl border border-line bg-surface px-5 py-4">
      <header className="mb-3">
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Placement presets
        </h2>
        <p className="mt-0.5 text-[12px] text-muted">
          Defaults for footer, partners rotate, and case gallery. Partner
          include/exclude still comes from the logo wall studio.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-[12px]">
          <span className="font-semibold text-ink">Footer logo limit</span>
          <input
            type="number"
            min={1}
            max={12}
            defaultValue={footerLimit}
            disabled={pending}
            className={field}
            onBlur={(e) => {
              const n = Number(e.target.value);
              if (!Number.isFinite(n)) return;
              start(async () => {
                await saveFooterPlacement({ limit: Math.round(n) });
              });
            }}
          />
        </label>

        <label className="block text-[12px]">
          <span className="font-semibold text-ink">Partners motion</span>
          <select
            defaultValue={partnersMotion}
            disabled={pending}
            className={field}
            onChange={(e) => {
              const motion = e.target.value as LogoMotion;
              start(async () => {
                await savePartnersPlacement({ motion });
              });
            }}
          >
            {LOGO_MOTION_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[12px]">
          <span className="font-semibold text-ink">Partners size</span>
          <select
            defaultValue={partnersSize}
            disabled={pending}
            className={field}
            onChange={(e) => {
              const size = e.target.value as LogoSize;
              start(async () => {
                await savePartnersPlacement({ size });
              });
            }}
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[12px]">
          <span className="font-semibold text-ink">Partners limit</span>
          <input
            type="number"
            min={1}
            max={30}
            defaultValue={partnersLimit}
            disabled={pending}
            className={field}
            onBlur={(e) => {
              const n = Number(e.target.value);
              if (!Number.isFinite(n)) return;
              start(async () => {
                await savePartnersPlacement({ limit: Math.round(n) });
              });
            }}
          />
        </label>

        <label className="block text-[12px] sm:col-span-2">
          <span className="font-semibold text-ink">Case gallery limit</span>
          <input
            type="number"
            min={1}
            max={12}
            defaultValue={casesLimit}
            disabled={pending}
            className={`${field} max-w-xs`}
            onBlur={(e) => {
              const n = Number(e.target.value);
              if (!Number.isFinite(n)) return;
              start(async () => {
                await saveCasesPlacement({ limit: Math.round(n) });
              });
            }}
          />
        </label>
      </div>
    </section>
  );
}
