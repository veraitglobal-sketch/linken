import {
  CalcomIcon,
  CalendlyIcon,
  ClaudeIcon,
  CursorIcon,
} from "@/components/marketing/home-integration-icons";
import {
  HOME_INTEGRATIONS,
  type IntegrationId,
  type IntegrationTile,
} from "@/components/marketing/home-integrations-data";

/**
 * Optical sizing, not geometric.
 *
 * Cal.com is a wordmark and the rest are glyphs, so equal box sizes rendered
 * it at 5,984px² against Cursor's 1,296 — a 4.6× spread, and the wordmark ate
 * the row. Each mark now gets its own height so the *ink* is even.
 * `EmbedBareLogo` carries per-logo `scale`/`padding` for the same reason.
 */
const MARK_HEIGHT: Record<IntegrationId, string> = {
  /* Wordmark: cropped to its ink, then set shorter than the glyphs — a run of
     letters carries its weight in width, so matching glyph height would make
     it shout. */
  calcom: "h-[15px] w-auto",
  calendly: "h-[26px] w-auto",
  claude: "h-[25px] w-auto",
  cursor: "h-[26px] w-auto",
};

function Mark({ id }: { id: IntegrationId }) {
  const c = MARK_HEIGHT[id];
  if (id === "calendly") return <CalendlyIcon className={c} />;
  if (id === "calcom") return <CalcomIcon className={c} />;
  if (id === "claude") return <ClaudeIcon className={c} />;
  return <CursorIcon className={c} />;
}

function Row({ item }: { item: IntegrationTile }) {
  const external = item.href.startsWith("http");
  return (
    <a
      href={item.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex flex-col gap-3 border-t border-line pt-5 no-underline"
    >
      {/* Brand colour, so a visitor recognises the mark at a glance. It is
          identification rather than an accent of ours — the palette rule
          governs Hansala's own surfaces, not somebody else's logo. */}
      <span
        className="flex h-8 items-center transition-opacity duration-200 group-hover:opacity-70"
        style={{ color: item.color }}
      >
        <Mark id={item.id} />
      </span>
      <span className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
        {item.kind}
      </span>
    </a>
  );
}

/**
 * A row, not a marquee.
 *
 * Four items cannot fill a rail, so the track tripled them and Cal.com showed
 * twice in one view. Four marks fit the column at rest — the movement was
 * hiding nothing and inventing a duplicate.
 */
export function HomeIntegrationsMarquee() {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-x-8 gap-y-8 p-0 sm:grid-cols-4 sm:gap-x-6">
      {HOME_INTEGRATIONS.map((item) => (
        <li key={item.id}>
          <Row item={item} />
        </li>
      ))}
    </ul>
  );
}
