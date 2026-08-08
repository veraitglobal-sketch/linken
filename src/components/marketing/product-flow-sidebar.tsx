import { NetworkMark } from "@/components/marketing/network-mark";
import { FLOW_HUB } from "@/components/marketing/product-flow-data";
import { FlowGlyph, FlowMark } from "@/components/marketing/product-flow-parts";
import { cn } from "@/lib/cn";

const NAV_MAIN: { label: string; d: string }[] = [
  {
    label: "Company",
    d: "M4 20V6l8-3 8 3v14M9 20v-5h6v5M8 9h.01M12 9h.01M16 9h.01",
  },
  { label: "Map", d: "M9 6 3 4v14l6 2 6-2 6 2V6l-6-2-6 2Zm0 0v14" },
  { label: "Inbox", d: "M3 12h5l2 3h4l2-3h5M4 6h16v12H4z" },
];

const NAV_MORE: { label: string; d: string; locked?: boolean }[] = [
  { label: "Case studies", d: "M5 4h14v16H5zM5 9h14M10 9v11" },
  { label: "Testimonials", d: "M5 7h14M5 12h14M5 17h8" },
  {
    label: "Verification",
    d: "M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3Zm-2 9 1.5 1.5L15 10",
  },
  {
    label: "Team access",
    d: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 8v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1",
  },
  { label: "Branches", d: "M12 4v6m0 0H7v4m5-4h5v4M5 14h4v4H5zm10 0h4v4h-4z" },
  { label: "Group", d: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" },
  { label: "Insights", d: "M4 20V10m5 10V4m5 16v-7m5 7V8" },
];

const NAV_FOOT: { label: string; d: string }[] = [
  { label: "Edit company", d: "M12 8v8M8 12h8M12 3v2M12 19v2M3 12h2M19 12h2" },
  {
    label: "Home",
    d: "M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z",
  },
];

function NavRow({
  label,
  d,
  active,
  locked,
}: {
  label: string;
  d: string;
  active?: boolean;
  locked?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px]",
        active
          ? "bg-[#f0f3f1] font-semibold text-blue"
          : locked
            ? "text-[#aab3ae]"
            : "text-ink-soft",
      )}
    >
      {active ? (
        <span className="absolute top-1.5 bottom-1.5 -left-3.5 w-[3px] rounded-full bg-blue" />
      ) : null}
      <span className={active ? "text-blue" : "text-[#96a09a]"}>
        <FlowGlyph d={d} />
      </span>
      <span className="flex-1 truncate">{label}</span>
    </span>
  );
}

export function FlowSidebar() {
  return (
    <nav className="flex w-[232px] shrink-0 flex-col border-r border-line/70 bg-surface px-3.5 py-4">
      <span className="flex items-center gap-2 px-1.5">
        <NetworkMark size={16} animate={false} />
        <span className="font-display text-[15px] font-semibold tracking-[-0.03em] text-blue">
          Hansala
        </span>
      </span>
      <span className="mt-4 flex items-center gap-2.5 rounded-xl border border-line/70 bg-[#f9faf9] px-2.5 py-2">
        <FlowMark
          name={FLOW_HUB.name}
          initials={FLOW_HUB.initials}
          logo={FLOW_HUB.logo}
          small
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-ink">
            {FLOW_HUB.name}
          </span>
          <span className="block truncate text-[11px] text-muted">
            Verified workspace
          </span>
        </span>
      </span>
      <p className="mt-5 px-3 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
        Main
      </p>
      <ul className="mt-1.5 space-y-0.5">
        {NAV_MAIN.map((i) => (
          <li key={i.label}>
            <NavRow {...i} active={i.label === "Map"} />
          </li>
        ))}
      </ul>
      <p className="mt-5 px-3 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
        More
      </p>
      <ul className="mt-1.5 space-y-0.5">
        {NAV_MORE.map((i) => (
          <li key={i.label}>
            <NavRow {...i} />
          </li>
        ))}
      </ul>
      <ul className="mt-5 space-y-0.5 border-t border-line/70 pt-4">
        {NAV_FOOT.map((i) => (
          <li key={i.label}>
            <NavRow {...i} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function FlowMapControls() {
  return (
    <div className="absolute bottom-5 left-5 flex flex-col overflow-hidden rounded-xl border border-line/80 bg-surface/95 backdrop-blur">
      {["M12 5v14M5 12h14", "M5 12h14", "M4 9V4h5M20 15v5h-5"].map((d, i) => (
        <span
          key={d}
          className={cn(
            "grid h-8 w-8 place-items-center text-muted",
            i > 0 && "border-t border-line/70",
          )}
        >
          <FlowGlyph d={d} />
        </span>
      ))}
    </div>
  );
}
