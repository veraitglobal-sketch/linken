"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { saveLogoWallBackground } from "@/features/widgets/logo-wall-studio-actions";
import { cn } from "@/lib/cn";

const PRESETS = [
  { id: "transparent", label: "Transparent" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
] as const;

type Props = {
  background: string;
};

export function LogoWallBackgroundPicker({ background }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isHex = /^#[0-9A-Fa-f]{6}$/.test(background);

  function setBg(value: string) {
    startTransition(async () => {
      await saveLogoWallBackground(value);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-[10px] font-semibold tracking-wide text-plus uppercase">
        Background
      </p>
      {PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          disabled={pending}
          onClick={() => setBg(p.id)}
          className={cn(
            "rounded-lg border px-2.5 py-1 text-[11px] font-semibold",
            background === p.id
              ? "border-ink bg-ink text-white"
              : "border-line bg-paper text-ink hover:bg-surface",
          )}
        >
          {p.label}
        </button>
      ))}
      <label className="flex items-center gap-1.5 text-[11px] text-muted">
        Hex
        <input
          type="text"
          defaultValue={isHex ? background : "#FFFFFF"}
          maxLength={7}
          placeholder="#RRGGBB"
          className="h-7 w-[5.5rem] rounded-md border border-line bg-surface px-2 font-mono text-[11px] text-ink"
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (/^#[0-9A-Fa-f]{6}$/.test(v)) setBg(v);
          }}
        />
      </label>
    </div>
  );
}
