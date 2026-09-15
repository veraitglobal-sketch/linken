type Props = {
  showTeam: boolean;
  showRefs: boolean;
  showCases: boolean;
  showPartners: boolean;
  showMap: boolean;
};

const ITEMS: Array<{
  key: keyof Omit<Props, "showMap"> | "showMap";
  href: string;
  label: string;
}> = [
  { key: "showTeam", href: "#team", label: "Team" },
  { key: "showRefs", href: "#references", label: "References" },
  { key: "showCases", href: "#case-studies", label: "Case studies" },
  { key: "showPartners", href: "#partners", label: "Partners" },
  { key: "showMap", href: "#network-map", label: "Map" },
];

/**
 * Jump bar for a page that is otherwise a long scroll. The anchors
 * (`#team`, `#references`, `#case-studies`, `#partners`, `#network-map`)
 * already exist on every section — this just makes them reachable in one
 * click instead of a scroll, the way a dense SaaS record page (not a
 * marketing page) lets you jump straight to the part you came for.
 */
export function ProfileSectionNav(props: Props) {
  const items = ITEMS.filter((item) => props[item.key]);
  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Sections on this page"
      className="sticky top-[76px] z-30 mt-10 px-4"
    >
      <ul className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-surface/90 p-1.5 whitespace-nowrap shadow-[0_10px_30px_-18px_rgba(14,31,28,0.35)] ring-1 ring-line/70 backdrop-blur">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="inline-flex h-10 items-center rounded-full px-4 text-[14px] font-semibold text-ink-soft transition-colors hover:bg-lime hover:text-navy"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
