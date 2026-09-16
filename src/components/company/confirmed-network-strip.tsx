import Link from "next/link";
import { LogoMark } from "@/components/ui/logo-mark";
import { companyPath, companyWithPath } from "@/features/seo/paths";
import type { Partner } from "@/types/partner";

type Props = {
  companySlug: string;
  companyName: string;
  partners: Partner[];
};

/**
 * Reciprocal strip — confirmed partners advertise each other on the profile.
 * Only accepted partners; each tile links to their profile and the pair record.
 */
export function ConfirmedNetworkStrip({
  companySlug,
  companyName,
  partners,
}: Props) {
  if (partners.length === 0) return null;

  return (
    <section
      id="confirmed-network"
      aria-label="Confirmed network"
      className="mx-auto mt-10 max-w-[1280px] px-4 sm:px-[18px]"
    >
      <div className="rounded-[28px] bg-surface px-5 py-7 ring-1 ring-line/70 sm:px-8 sm:py-8">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          Confirmed with
        </p>
        <h2 className="mt-2 font-display text-[1.35rem] font-semibold tracking-[-0.03em] text-ink sm:text-[1.5rem]">
          {companyName}&apos;s confirmed network
        </h2>
        <p className="mt-1.5 max-w-[54ch] text-[14px] leading-relaxed text-muted">
          Each company below accepted this relationship. Both sides can share the
          record.
        </p>
        <ul className="mt-6 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {partners.slice(0, 12).map((p) => (
            <li key={p.id}>
              <div className="flex items-center gap-3 rounded-2xl bg-wash/80 px-3.5 py-3 ring-1 ring-line/60">
                <Link
                  href={companyPath(p.slug)}
                  className="shrink-0"
                  aria-label={p.name}
                >
                  <LogoMark
                    initials={p.logoInitials}
                    logoUrl={p.logoUrl}
                    size="md"
                    className="rounded-xl!"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={companyPath(p.slug)}
                    className="block truncate font-display text-[15px] font-semibold tracking-[-0.02em] text-ink hover:underline"
                  >
                    {p.name}
                  </Link>
                  <p className="truncate text-[12.5px] text-muted">
                    {[p.category, p.city].filter(Boolean).join(" · ")}
                  </p>
                  <Link
                    href={companyWithPath(companySlug, p.slug)}
                    className="mt-1 inline-block text-[12.5px] font-semibold text-navy underline-offset-2 hover:underline"
                  >
                    Shared record →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {partners.length > 12 ? (
          <p className="mt-4 text-[13px] text-muted">
            <Link
              href={`/c/${companySlug}/partners`}
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              View all {partners.length} confirmed partners
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
