import Link from "next/link";

type Props = {
  title: string;
  total: number;
  crumb?: { href: string; label: string };
};

export function CompanyDirectoryHero({ title, total, crumb }: Props) {
  return (
    <section className="relative -mt-[4.25rem] px-4 pt-[8rem] sm:px-6 sm:pt-[9rem] lg:px-8">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 bottom-10 rounded-b-[48px] bg-lime sm:rounded-b-[120px]"
      />
      <div className="relative mx-auto max-w-[1180px]">
        <p className="text-[13px] font-semibold tracking-[0.14em] text-navy/70 uppercase">
          Directory
        </p>
        <h1 className="mt-3 max-w-[20ch] font-display text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-ink text-balance">
          {title}
        </h1>
        <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-ink-soft">
          {crumb ? (
            <>
              <Link href={crumb.href} className="font-semibold text-navy hover:underline">
                {crumb.label}
              </Link>
              {" · "}
            </>
          ) : null}
          {total} {total === 1 ? "company" : "companies"} on Hansala.{" "}
          <Link href="/search" className="font-semibold text-navy hover:underline">
            Search
          </Link>{" "}
          by name, sector or city.
        </p>
      </div>
    </section>
  );
}
