import Link from "next/link";
import { DOCS_LINKS } from "@/components/developers/docs-content";

/** Legal / discovery links under docs Contents. */
export function DocsPlatformLinks() {
  return (
    <div className="mt-5 border-t border-line pt-4">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
        Platform
      </p>
      <ul className="mt-2 space-y-0.5">
        {DOCS_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded-xl px-2.5 py-1.5 text-[13px] text-ink-soft transition-colors hover:bg-paper hover:text-ink"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
