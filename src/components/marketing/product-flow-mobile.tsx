import {
  FLOW_TARGET,
} from "@/components/marketing/product-flow-data";
import { cn } from "@/lib/cn";

/** Stacked story at 390px — no scaled map (type would be unreadable). */
export function FlowMobile({
  step,
  confirmed,
}: {
  step: number;
  confirmed: boolean;
}) {
  const cards = [
    {
      active: step <= 5,
      label: "You add them",
      body: FLOW_TARGET.name,
      meta: FLOW_TARGET.domain,
      pill: confirmed ? "Official" : step >= 5 ? "Pending" : "Request",
    },
    {
      active: step >= 6 && step <= 7,
      label: "They confirm",
      body: "Confirm partnership",
      meta: "Nothing is public until they press it.",
      pill: step >= 7 ? "Confirmed" : "Waiting",
    },
    {
      active: step >= 8,
      label: "It becomes public",
      body: FLOW_TARGET.name,
      meta: "Confirmed by both companies",
      pill: "Official",
    },
  ];

  return (
    <div className="space-y-2.5">
      {cards.map((c) => (
        <div
          key={c.label}
          className={cn(
            "rounded-2xl border px-4 py-3.5 transition-colors duration-500",
            c.active
              ? "border-white/25 bg-white/[0.07]"
              : "border-white/10 bg-white/[0.02]",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-white/45 uppercase">
              {c.label}
            </p>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
              {c.pill}
            </span>
          </div>
          <p className="mt-2 text-[15px] font-semibold text-white">{c.body}</p>
          <p className="mt-0.5 text-[12px] text-white/50">{c.meta}</p>
        </div>
      ))}
    </div>
  );
}
