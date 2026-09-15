"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { Panel, useReactFlow } from "@xyflow/react";
import { LogoTile } from "@/components/ui/logo-tile";
import type { NetworkNodeData, NetworkNodeKind } from "@/features/network/types";
import { cn } from "@/lib/cn";

/**
 * Workspace map chrome, laid out like a flow builder: a navy header with the
 * map's identity and actions, a Palette / Outline panel, a canvas toolbar,
 * labelled zoom controls and a status line. Every control calls something
 * real — add a partner, open a workspace page, select, zoom, re-arrange.
 */

const ROLE: Record<NetworkNodeKind, string> = {
  group: "Group",
  company: "Company",
  subsidiary: "Subsidiary",
  partner: "Partner",
  client: "Client",
};

const S = { stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

/* ---------- header ---------- */

function HeaderIconButton({
  title,
  onClick,
  active = false,
  children,
}: {
  title: string;
  onClick?: () => void;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      aria-pressed={active || undefined}
      className={cn(
        "grid size-10 place-items-center rounded-xl ring-1 transition-colors",
        active
          ? "bg-white text-navy ring-white"
          : "bg-white/[0.06] text-on-navy ring-white/20 hover:bg-white/15",
      )}
    >
      {children}
      <span className="sr-only">{title}</span>
    </button>
  );
}

export function MapHeader({
  title,
  eyebrow,
  slug,
  editable,
  pendingInviteCount,
  onAdd,
  addHref,
  showDots,
  onToggleDots,
  fullscreen,
  onToggleFullscreen,
  onReset,
  structureTools,
}: {
  title: string;
  eyebrow: string;
  slug: string;
  editable: boolean;
  pendingInviteCount: number;
  onAdd: () => void;
  addHref: string | null;
  showDots: boolean;
  onToggleDots: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onReset: () => void;
  structureTools?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState<"help" | "more" | null>(null);
  const publicPath = `hansala.com/c/${slug}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${publicPath}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — nothing to report */
    }
  };

  return (
    <section className="relative flex shrink-0 flex-wrap items-center gap-4 rounded-[20px] bg-navy px-4 py-4 text-on-navy sm:px-6">
      <Link
        href="/dashboard"
        title="Back to Home"
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] ring-1 ring-white/20 transition-colors hover:bg-white/15"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path d="M19 12H5m6-6-6 6 6 6" {...S} strokeWidth={2} />
        </svg>
        <span className="sr-only">Back to Home</span>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate font-display text-[22px] leading-tight font-semibold tracking-[-0.02em] sm:text-[24px]">
            {title}
          </h1>
          <Link href={`/c/${slug}/edit`} title="Edit company" className="text-on-navy-soft transition-colors hover:text-lime">
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="3" {...S} />
              <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" {...S} />
            </svg>
            <span className="sr-only">Edit company</span>
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex h-7 items-center rounded-md bg-lime/15 px-2.5 text-[12px] font-bold tracking-[0.04em] text-lime uppercase">
            {eyebrow}
          </span>
          <span className="truncate font-mono text-[12.5px] text-on-navy-soft">{publicPath}</span>
          <button
            type="button"
            onClick={copy}
            title="Copy public link"
            className="grid size-8 place-items-center rounded-lg bg-white/[0.06] ring-1 ring-white/20 transition-colors hover:bg-white/15"
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                <path d="m5 12.5 4.5 4.5L19 7.5" {...S} stroke="var(--lime)" strokeWidth={2.2} />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                <rect x="8" y="8" width="12" height="12" rx="2.5" {...S} />
                <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" {...S} />
              </svg>
            )}
            <span className="sr-only">{copied ? "Copied" : "Copy public link"}</span>
          </button>
          <span className="inline-flex items-center gap-1.5 text-[13px] text-on-navy-soft">
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="8.5" {...S} stroke="var(--lime)" />
              <path d="m8.5 12.3 2.3 2.3 4.7-5" {...S} stroke="var(--lime)" />
            </svg>
            {pendingInviteCount > 0 ? (
              <Link href="/dashboard/partners" className="underline-offset-2 hover:underline">
                {pendingInviteCount} pending · shows once confirmed
              </Link>
            ) : (
              "Confirmed links appear automatically"
            )}
          </span>
        </div>
      </div>

      <div className="relative flex shrink-0 flex-wrap items-center gap-2">
        {structureTools}
        <HeaderIconButton title="How the map works" active={menu === "help"} onClick={() => setMenu(menu === "help" ? null : "help")}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" {...S} />
            <path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4" {...S} />
            <circle cx="12" cy="16.8" r="1" fill="currentColor" />
          </svg>
        </HeaderIconButton>
        <HeaderIconButton title={fullscreen ? "Exit full screen" : "Full screen"} active={fullscreen} onClick={onToggleFullscreen}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            {fullscreen ? (
              <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" {...S} strokeWidth={2} />
            ) : (
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" {...S} strokeWidth={2} />
            )}
          </svg>
        </HeaderIconButton>
        <HeaderIconButton title={showDots ? "Hide grid" : "Show grid"} active={showDots} onClick={onToggleDots}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            {[5, 9.7, 14.3, 19].flatMap((y) =>
              [5, 9.7, 14.3, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.15" fill="currentColor" />),
            )}
          </svg>
        </HeaderIconButton>
        <HeaderIconButton title="More" active={menu === "more"} onClick={() => setMenu(menu === "more" ? null : "more")}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="5.5" r="1.6" fill="currentColor" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" />
            <circle cx="12" cy="18.5" r="1.6" fill="currentColor" />
          </svg>
        </HeaderIconButton>

        {editable ? (
          addHref ? (
            <Link
              href={addHref}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-lime px-4 text-[14px] font-semibold text-navy transition-colors hover:bg-[#bfe56c]"
            >
              <LinkGlyph />
              Add partners
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-lime px-4 text-[14px] font-semibold text-navy transition-colors hover:bg-[#bfe56c]"
            >
              <LinkGlyph />
              Add
            </button>
          )
        ) : null}

        {menu ? (
          <div className="absolute top-[calc(100%+10px)] right-0 z-40 w-72 rounded-2xl bg-surface p-2 text-ink shadow-[0_24px_48px_-20px_rgba(14,31,28,0.5)] ring-1 ring-line">
            {menu === "help" ? (
              <ul className="space-y-2 p-2 text-[13px] leading-relaxed text-ink-soft">
                <li><b className="text-ink">Click</b> a company to open its record.</li>
                <li><b className="text-ink">Drag</b> cards to arrange them — positions are saved in this browser.</li>
                <li><b className="text-ink">Scroll</b> to move, pinch or use the zoom buttons to zoom.</li>
                <li>A link appears only after both companies confirmed it.</li>
              </ul>
            ) : (
              <div className="flex flex-col">
                <Link href={`/c/${slug}`} className="rounded-xl px-3 py-2.5 text-[14px] font-medium hover:bg-mute">
                  Open public profile
                </Link>
                <Link href="/dashboard/partners" className="rounded-xl px-3 py-2.5 text-[14px] font-medium hover:bg-mute">
                  Partner requests
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    onReset();
                    setMenu(null);
                  }}
                  className="rounded-xl px-3 py-2.5 text-left text-[14px] font-medium hover:bg-mute"
                >
                  Reset layout
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function LinkGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <circle cx="6.5" cy="12" r="3.2" {...S} strokeWidth={1.9} />
      <circle cx="17.5" cy="12" r="3.2" {...S} strokeWidth={1.9} />
      <path d="M9.7 12h4.6" {...S} strokeWidth={1.9} />
    </svg>
  );
}

/* ---------- palette / outline ---------- */

type PaletteItem = {
  key: string;
  title: string;
  body: string;
  tile: string;
  icon: ReactNode;
} & ({ href: string } | { action: "add" });

/* Hand-drawn glyphs for what this map is made of. */
const GLYPH = {
  partner: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <rect x="2.5" y="7" width="7" height="10" rx="2" {...S} />
      <rect x="14.5" y="7" width="7" height="10" rx="2" {...S} />
      <path d="M9.5 12h5" {...S} />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    </svg>
  ),
  invite: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="6" width="14" height="11" rx="2" {...S} />
      <path d="m3.5 7 6.5 5 6.5-5" {...S} />
      <path d="M19.5 9v6M16.5 12h6" {...S} />
    </svg>
  ),
  subsidiary: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <rect x="8.5" y="3" width="7" height="5" rx="1.5" {...S} />
      <rect x="3" y="16" width="7" height="5" rx="1.5" {...S} />
      <rect x="14" y="16" width="7" height="5" rx="1.5" {...S} />
      <path d="M12 8v4M6.5 16v-4h11v4" {...S} />
    </svg>
  ),
  case: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" {...S} />
      <path d="m9 13.2 2 2 4-4.2" {...S} />
    </svg>
  ),
  quote: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 19V9.5A4.5 4.5 0 0 1 8.5 5M4 13h5v6H4M13.5 19V9.5A4.5 4.5 0 0 1 18 5M13.5 13h5v6h-5" {...S} />
    </svg>
  ),
  team: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <circle cx="9" cy="8.5" r="3.2" {...S} />
      <path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5" {...S} />
      <path d="M15.5 5.6a3 3 0 0 1 0 5.8M18 14.8c1.6.7 2.7 2.3 3 4.7" {...S} />
    </svg>
  ),
};

function paletteItems(isGroup: boolean, addHref: string | null): PaletteItem[] {
  const items: PaletteItem[] = [
    {
      key: "partner",
      title: "Partner",
      body: "A company you worked with.",
      tile: "bg-lime text-navy",
      icon: GLYPH.partner,
      action: "add",
    },
    {
      key: "invite",
      title: "Invite by email",
      body: "A company not on Hansala yet.",
      tile: "bg-lime-soft text-navy",
      icon: GLYPH.invite,
      ...(addHref ? { href: addHref } : { action: "add" as const }),
    },
    {
      key: "subsidiary",
      title: isGroup ? "Group member" : "Subsidiary",
      body: "A company in your structure.",
      tile: "bg-navy text-lime",
      icon: GLYPH.subsidiary,
      href: "/dashboard/structure",
    },
    {
      key: "case",
      title: "Case study",
      body: "A project, confirmed by the client.",
      tile: "bg-mute text-ink",
      icon: GLYPH.case,
      href: "/dashboard/cases",
    },
    {
      key: "quote",
      title: "Testimonial",
      body: "Words from a client.",
      tile: "bg-mute text-ink",
      icon: GLYPH.quote,
      href: "/dashboard/testimonials",
    },
    {
      key: "team",
      title: "Team member",
      body: "People who can work on this map.",
      tile: "bg-wash-deep text-navy",
      icon: GLYPH.team,
      href: "/dashboard/team",
    },
  ];
  return items;
}

export function MapPalette({
  nodes,
  selectedId,
  onSelect,
  onAdd,
  addHref,
  isGroup,
  editable,
}: {
  nodes: { id: string; data: NetworkNodeData }[];
  selectedId: string | null;
  onSelect: (id: string, data: NetworkNodeData) => void;
  onAdd: () => void;
  addHref: string | null;
  isGroup: boolean;
  editable: boolean;
}) {
  const [tab, setTab] = useState<"palette" | "outline">(editable ? "palette" : "outline");
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();

  const items = useMemo(
    () =>
      paletteItems(isGroup, addHref).filter(
        (i) => !needle || `${i.title} ${i.body}`.toLowerCase().includes(needle),
      ),
    [isGroup, addHref, needle],
  );
  const outline = useMemo(
    () =>
      nodes
        .filter((n) => !n.data.moreCount)
        .filter((n) => !needle || n.data.name.toLowerCase().includes(needle)),
    [nodes, needle],
  );

  const row =
    "flex w-full items-center gap-3 rounded-xl bg-surface px-3 py-2.5 text-left ring-1 ring-line/80 transition-[box-shadow,background-color] hover:ring-navy/30 hover:shadow-[0_6px_16px_-12px_rgba(14,31,28,0.4)]";

  return (
    <aside className="hidden w-[300px] shrink-0 flex-col border-r border-line/70 bg-[#fafbf9] lg:flex">
      <div className="p-3">
        <div className="grid grid-cols-2 rounded-xl bg-mute p-1" role="tablist">
          {(
            [
              ["palette", "Palette"],
              ["outline", "Outline"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex h-9 items-center justify-center gap-2 rounded-lg text-[13px] font-semibold transition-colors",
                tab === id ? "bg-surface text-ink shadow-[0_2px_6px_-3px_rgba(14,31,28,0.3)]" : "text-ink-soft hover:text-ink",
              )}
            >
              {id === "palette" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                  <rect x="4" y="4" width="16" height="16" rx="3" {...S} />
                  <path d="M4 10h16M10 10v10" {...S} />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                  <rect x="3" y="4" width="6" height="5" rx="1.2" {...S} />
                  <rect x="15" y="15" width="6" height="5" rx="1.2" {...S} />
                  <path d="M6 9v8.5h9" {...S} />
                </svg>
              )}
              {label}
            </button>
          ))}
        </div>

        <label className="relative mt-3 block">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
              <circle cx="11" cy="11" r="6.5" {...S} />
              <path d="m16 16 4 4" {...S} />
            </svg>
          </span>
          <span className="sr-only">{tab === "palette" ? "Search actions" : "Search companies on this map"}</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tab === "palette" ? "Search actions…" : "Search companies…"}
            style={{ outline: "none" }}
            className="h-10 w-full rounded-xl bg-mute pr-3 pl-9 text-[13px] text-ink placeholder:text-muted focus:bg-surface focus:ring-1 focus:ring-navy/30"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {tab === "palette" ? (
          <ul className="space-y-2">
            {items.map((item) => {
              const body = (
                <>
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", item.tile)}>{item.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-ink">{item.title}</span>
                    <span className="block truncate text-[12px] text-muted">{item.body}</span>
                  </span>
                </>
              );
              return (
                <li key={item.key}>
                  {"href" in item ? (
                    <Link href={item.href} className={row}>
                      {body}
                    </Link>
                  ) : (
                    <button type="button" onClick={onAdd} className={row}>
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
            {items.length === 0 ? <li className="px-1 py-2 text-[13px] text-muted">No action matches.</li> : null}
          </ul>
        ) : (
          <ul className="space-y-1.5">
            {outline.map((n) => {
              const on = n.id === selectedId;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(n.id, n.data)}
                    className={cn(row, on && "bg-lime-soft ring-navy/30")}
                  >
                    <LogoTile
                      name={n.data.name}
                      initials={n.data.logoInitials}
                      logoUrl={n.data.logoUrl}
                      website={n.data.website}
                      allowFavicon
                      size="sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-ink">{n.data.name}</span>
                      <span className="block truncate text-[12px] text-muted">{ROLE[n.data.kind]}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            {outline.length === 0 ? <li className="px-1 py-2 text-[13px] text-muted">No company matches.</li> : null}
          </ul>
        )}

        <p className="mt-4 px-1 text-[12.5px] leading-relaxed text-muted">
          {tab === "palette"
            ? "Pick what to add. A company appears on the map once it confirms the link."
            : "Click a company to open its record. Drag cards on the canvas to arrange them."}
        </p>
      </div>
    </aside>
  );
}

/* ---------- canvas toolbar, zoom, status ---------- */

export type MapTool = "pan" | "select";
export type MapDirection = "vertical" | "horizontal";

function Segment<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string; icon: ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center rounded-xl bg-surface p-1 shadow-[0_2px_8px_-4px_rgba(14,31,28,0.25)] ring-1 ring-line/80">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-colors",
            value === o.id ? "bg-lime-soft text-navy" : "text-ink-soft hover:text-ink",
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Must render inside <ReactFlow>. */
export function MapCanvasToolbar({
  tool,
  onTool,
  direction,
  onDirection,
  onArrange,
}: {
  tool: MapTool;
  onTool: (t: MapTool) => void;
  /** Null when the layout has no orientation choice (ownership tree). */
  direction: MapDirection | null;
  onDirection: (d: MapDirection) => void;
  onArrange: () => void;
}) {
  return (
    <>
      <Panel position="top-left" className="!m-3 flex items-center gap-2">
        <Segment
          value={tool}
          onChange={onTool}
          options={[
            {
              id: "pan",
              label: "Pan",
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11m0-5.5V4.5a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V13m0-3.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.2a6 6 0 0 1-4.6-2.2L5 15.5a1.6 1.6 0 0 1 2.4-2.1L8 14" {...S} />
                </svg>
              ),
            },
            {
              id: "select",
              label: "Select",
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                  <path d="m5 4 14 6.5-6 1.8-2.2 6.2z" {...S} />
                </svg>
              ),
            },
          ]}
        />
        <button
          type="button"
          onClick={onArrange}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-surface px-3 text-[13px] font-semibold text-ink shadow-[0_2px_8px_-4px_rgba(14,31,28,0.25)] ring-1 ring-line/80 transition-colors hover:bg-mute"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
            <rect x="3" y="4" width="6" height="5" rx="1.2" {...S} />
            <rect x="15" y="4" width="6" height="5" rx="1.2" {...S} />
            <rect x="9" y="15" width="6" height="5" rx="1.2" {...S} />
            <path d="M6 9v2.5h12V9M12 11.5V15" {...S} />
          </svg>
          Auto-arrange
        </button>
      </Panel>
      {direction ? (
        <Panel position="top-right" className="!m-3">
          <Segment
            value={direction}
            onChange={onDirection}
            options={[
              {
                id: "horizontal",
                label: "Horizontal",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                    <path d="M4 12h15m-5-5 5 5-5 5" {...S} />
                  </svg>
                ),
              },
              {
                id: "vertical",
                label: "Vertical",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 4v15m-5-5 5 5 5-5" {...S} />
                  </svg>
                ),
              },
            ]}
          />
        </Panel>
      ) : null}
    </>
  );
}

/** Labelled zoom stack — must render inside <ReactFlow>. */
export function MapZoomControls({ startId }: { startId: string | null }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const btn =
    "inline-flex h-9 items-center gap-2 rounded-full bg-surface pr-4 pl-3 text-[13px] font-semibold text-ink ring-1 ring-line shadow-[0_4px_12px_-8px_rgba(14,31,28,0.4)] transition-colors hover:bg-mute";
  return (
    <Panel position="bottom-left" className="!m-4 flex flex-col items-start gap-2">
      <button type="button" className={btn} onClick={() => zoomIn({ duration: 200 })}>
        <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden><path d="M12 5v14M5 12h14" {...S} strokeWidth={2} /></svg>
        Zoom in
      </button>
      <button type="button" className={btn} onClick={() => zoomOut({ duration: 200 })}>
        <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden><path d="M5 12h14" {...S} strokeWidth={2} /></svg>
        Zoom out
      </button>
      <button type="button" className={btn} onClick={() => fitView({ padding: 0.25, maxZoom: 1.2, duration: 250 })}>
        <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden>
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" {...S} strokeWidth={2} />
          <rect x="9" y="9" width="6" height="6" rx="1" {...S} />
        </svg>
        Fit view
      </button>
      {startId ? (
        <button
          type="button"
          className={btn}
          onClick={() => fitView({ nodes: [{ id: startId }], maxZoom: 1.2, duration: 300 })}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="3.5" {...S} strokeWidth={2} />
            <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" {...S} strokeWidth={2} />
          </svg>
          Go to start
        </button>
      ) : null}
    </Panel>
  );
}

export function MapStatusBar({
  counts,
  pendingInviteCount,
  legend,
}: {
  counts: string[];
  pendingInviteCount: number;
  legend: ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-line/70 bg-surface px-5 py-3">
      <span className="grid size-5 place-items-center rounded-full ring-[1.5px] ring-[#7cb342]/0">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" fill="var(--lime-soft)" stroke="var(--navy)" strokeWidth="1.5" />
          <path d="m8.3 12.3 2.4 2.4 5-5.3" {...S} stroke="var(--navy)" strokeWidth={1.8} />
        </svg>
      </span>
      <span className="text-[14px] font-semibold text-ink">Public shows confirmed only</span>
      <span className="text-[13px] text-muted">
        {[...counts, pendingInviteCount > 0 ? `${pendingInviteCount} pending, private to you` : null]
          .filter(Boolean)
          .join(" · ")}
      </span>
      <div className="ml-auto">{legend}</div>
    </div>
  );
}
