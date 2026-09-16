import type { ReactNode } from "react";

/**
 * Before the first keystroke: what each part of a result means.
 *
 * Each fact is drawn rather than labelled — a website carrying the mark, two
 * companies joined by a yes, a profile still in outline. The drawings use no
 * company, name or number: they explain a state, they do not stand in for one.
 */
export function SearchLegend() {
  return (
    <section aria-label="Reading a result">
      <p className="px-1 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
        Reading a result
      </p>
      <ul className="mt-4 grid list-none gap-3 p-0 md:grid-cols-3">
        {LEGEND.map((item) => (
          <li
            key={item.title}
            className="flex flex-col rounded-[26px] bg-surface p-2 ring-1 ring-line/70"
          >
            <div className="relative grid h-40 place-items-center overflow-hidden rounded-[20px] bg-wash">
              <span
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle,rgba(14,31,28,0.07)_1px,transparent_1.6px)] [background-size:14px_14px]"
              />
              <div className="relative">{item.art}</div>
            </div>
            <div className="px-4 pt-4 pb-5">
              <p className="text-[12px] font-semibold text-muted">{item.label}</p>
              <p className="mt-1 font-display text-[18px] font-semibold tracking-[-0.025em] text-ink">
                {item.title}
              </p>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-soft">{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const NAVY = "#0e1f1c";
const LIME = "#cdef84";
const LIME_SOFT = "#e6f7c4";
const LINE = "#dde2df";

/** A browser window whose address is proven: the lock in the bar, the mark on the page. */
function VerifiedArt() {
  return (
    <svg width="210" height="124" viewBox="0 0 210 124" fill="none" aria-hidden>
      <rect x="18" y="12" width="164" height="100" rx="14" fill="#fff" stroke={LINE} />
      <path d="M18 34h164" stroke={LINE} />
      <circle cx="32" cy="23" r="3" fill={LINE} />
      <circle cx="42" cy="23" r="3" fill={LINE} />
      <circle cx="52" cy="23" r="3" fill={LINE} />
      <rect x="66" y="17" width="96" height="12" rx="6" fill="#f3f5f3" />
      <rect x="72" y="20.5" width="6" height="5" rx="1.2" fill={NAVY} />
      <path d="M73.2 20.5v-1.3a1.8 1.8 0 0 1 3.6 0v1.3" stroke={NAVY} strokeWidth="1.1" />
      <rect x="84" y="21.5" width="52" height="3" rx="1.5" fill="#c9d0cc" />
      <rect x="34" y="48" width="58" height="8" rx="4" fill={NAVY} />
      <rect x="34" y="63" width="92" height="5" rx="2.5" fill="#e3e8e5" />
      <rect x="34" y="74" width="78" height="5" rx="2.5" fill="#e3e8e5" />
      <rect x="34" y="90" width="44" height="12" rx="6" fill={LIME_SOFT} />
      <circle cx="170" cy="92" r="24" fill={LIME} stroke="#fff" strokeWidth="4" />
      <path d="m159.5 92.5 7 7 14-15" stroke={NAVY} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Two companies, one line between them, and a yes from each end. */
function PartnersArt() {
  return (
    <svg width="220" height="124" viewBox="0 0 220 124" fill="none" aria-hidden>
      <path d="M62 66h96" stroke={NAVY} strokeWidth="2.5" strokeDasharray="1 0" />
      <rect x="14" y="34" width="60" height="64" rx="16" fill="#fff" stroke={LINE} />
      <circle cx="44" cy="58" r="11" stroke={NAVY} strokeWidth="3" />
      <rect x="30" y="78" width="28" height="5" rx="2.5" fill="#e3e8e5" />
      <rect x="146" y="34" width="60" height="64" rx="16" fill="#fff" stroke={LINE} />
      <path d="m176 47 12 20h-24z" stroke={NAVY} strokeWidth="3" strokeLinejoin="round" />
      <rect x="162" y="78" width="28" height="5" rx="2.5" fill="#e3e8e5" />
      <rect x="86" y="54" width="48" height="24" rx="12" fill={NAVY} />
      <path d="m101 66.5 5 5 9.5-10" stroke={LIME} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="66" cy="32" r="11" fill={LIME} stroke="#fff" strokeWidth="3" />
      <path d="m61.5 32.5 3 3 6-6.5" stroke={NAVY} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="154" cy="32" r="11" fill={LIME} stroke="#fff" strokeWidth="3" />
      <path d="m149.5 32.5 3 3 6-6.5" stroke={NAVY} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A profile still in outline, and the partner whose listing drew it. */
function UnclaimedArt() {
  return (
    <svg width="220" height="124" viewBox="0 0 220 124" fill="none" aria-hidden>
      <rect x="14" y="44" width="54" height="54" rx="15" fill="#fff" stroke={LINE} />
      <rect x="28" y="58" width="26" height="26" rx="8" fill={NAVY} />
      <path d="M36 71h10M41 66v10" stroke={LIME} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M76 71c14 0 18-10 32-10" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 5" />
      <path d="m104 56 6 5-6.5 4.5" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="118" y="20" width="88" height="90" rx="16" fill="#fff" fillOpacity="0.55" stroke="#9aa39f" strokeWidth="1.6" strokeDasharray="5 5" />
      <circle cx="162" cy="48" r="13" stroke="#9aa39f" strokeWidth="1.6" strokeDasharray="4 4" />
      <rect x="138" y="70" width="48" height="6" rx="3" fill="#e3e8e5" />
      <rect x="146" y="82" width="32" height="5" rx="2.5" fill="#e3e8e5" />
      <rect x="140" y="95" width="44" height="10" rx="5" fill="#eceeed" />
    </svg>
  );
}

const LEGEND: { label: string; title: string; body: string; art: ReactNode }[] = [
  {
    label: "Verified domain",
    title: "The website is theirs",
    body: "The company proved it controls the domain on its profile.",
    art: <VerifiedArt />,
  },
  {
    label: "Confirmed partners",
    title: "Both sides said yes",
    body: "A partner is counted only after the other company accepted the link. Pending requests never show.",
    art: <PartnersArt />,
  },
  {
    label: "Unclaimed profile",
    title: "Added by a partner",
    body: "Another company listed it. The company itself has not taken the profile over yet.",
    art: <UnclaimedArt />,
  },
];
