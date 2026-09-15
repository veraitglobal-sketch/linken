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
      className="sticky top-[60px] z-30 mt-6 border-y border-line bg-mute/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 py-3 text-[13px] font-medium whitespace-nowrap text-ink-soft">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
