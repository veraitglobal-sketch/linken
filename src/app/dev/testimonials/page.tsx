import { notFound } from "next/navigation";
import { EmbedTestimonialCard } from "@/components/embed/embed-testimonial-card";
import { EmbedTestimonials } from "@/components/embed/embed-testimonials";
import { EmbedTestimonialThemeShell } from "@/components/embed/embed-testimonial-theme-shell";
import { HomeProofWall } from "@/components/marketing/home-proof-wall";
import { PRESET_TOKENS } from "@/features/testimonials/theme/presets";
import { EXAMPLE_TESTIMONIALS } from "@/features/testimonials/example-records";
import type { PublicTestimonial } from "@/features/testimonials/types";

export const dynamic = "force-dynamic";

/**
 * Design preview for the wall layout. Dev only — `notFound()` below is what
 * lets this page hold example records at all: AGENTS.md forbids a placeholder
 * reaching a visitor, and in production there is no page here to reach.
 *
 * One record is real, and marked so: Dienstemarkt confirmed Vera IT, the same
 * one `RecordStage` and `CheckAnswer` print. Everything else is example copy
 * written to be recognisable as example copy — it exists to set type at six
 * different lengths, not to look like praise. Judge the ragging and the card
 * rhythm from it; do not judge the tone.
 */

const REAL: PublicTestimonial = {
  id: "vera-dienstemarkt",
  body: "vera quickly understood our vision for dienstemarkt.de and turned it into a professional, high-quality platform. The collaboration was smooth, reliable, and solution-focused from start to finish.",
  authorName: "Jovica Mihajlovic",
  authorRole: "CEO",
  authorCompany: null,
  source: "partnership",
  /* Empty rather than invented, the same way `RecordStage` leaves it. The card
     omits the line when there is nothing true to put in it. */
  publishedAt: "",
  profileUrl: "/c/verait",
  provenanceLine: "Confirmed by the client",
};

/* The one true record first, then the example set — which lives in
   `features/testimonials/example-records.ts` rather than here, so the docs and
   any preview draw on the same cast instead of each inventing their own. */
const ITEMS: PublicTestimonial[] = [REAL, ...EXAMPLE_TESTIMONIALS];

function Stage({
  title,
  note,
  preset,
  width,
  dark = false,
  stage,
  checker = false,
}: {
  title: string;
  note: string;
  preset: keyof typeof PRESET_TOKENS;
  width: number;
  dark?: boolean;
  /** Explicit host ground, for checking a translucent fill on a mid tone. */
  stage?: string;
  /** Checkerboard instead of a colour — transparency you can see, not measure. */
  checker?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
          {title}
        </h2>
        <p className="mt-1 text-[13px] text-muted">{note}</p>
      </div>
      {/* Through `EmbedTestimonials`, not the wall component directly — this is
          the path a real embed takes, so it also exercises the layout switch,
          the fit filter and the placement rail. */}
      <div
        className="rounded-card p-6"
        style={
          checker
            ? {
                maxWidth: width,
                /* The classic transparency checkerboard. Anything the widget
                   paints hides it; anything that stays see-through does not. */
                backgroundImage:
                  "linear-gradient(45deg, #d8ded9 25%, transparent 25%), linear-gradient(-45deg, #d8ded9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d8ded9 75%), linear-gradient(-45deg, transparent 75%, #d8ded9 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
                backgroundColor: "#f3f5f3",
              }
            : { background: stage ?? (dark ? "#081412" : "#ffffff"), maxWidth: width }
        }
      >
        <EmbedTestimonials
          items={ITEMS}
          layout="wall"
          theme={PRESET_TOKENS[preset]}
          themeParam={dark ? "dark" : "light"}
          profileUrl="/c/example-architecture"
          companyName="Example Architecture"
        />
      </div>
    </section>
  );
}

export default function DevTestimonialsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      {/* Full-bleed, outside the measured column below — this is the section as
          it would sit on a page, not a specimen on a swatch card. */}
      <HomeProofWall
        feature={REAL}
        wall={ITEMS.slice(1)}
        profileUrl="/c/example-architecture"
      />
      <main className="mx-auto max-w-5xl px-4 py-10 pb-24">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#7eb8a4] uppercase">
        Dev only
      </p>
      <h1 className="mt-2 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-medium tracking-[-0.04em] text-ink">
        Testimonials — the wall
      </h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-soft">
        Columns of quotes drifting upward behind a soft top and bottom edge. The
        column count is read from the container, not the viewport; motion parks
        itself off-screen, on a hidden tab, and for reduced motion. One record
        below is real — the rest is example copy at six lengths, to set type
        against.
      </p>

      <div className="mt-10 space-y-14">
        <Stage
          title="Card preset · 736px"
          note="The width the composition was measured at. Two columns."
          preset="card"
          width={736}
        />
        <Stage
          title="Card preset · 380px"
          note="A narrow host column. The container drops it to one column on its own."
          preset="card"
          width={380}
        />
        <Stage
          title="Minimal preset · 736px"
          note="No card background, no border — the wall carried by type alone."
          preset="minimal"
          width={736}
        />
        <Stage
          title="Dark preset · 736px"
          note="On a dark host page. The fill is white at 6% — neutral, so it takes the host's dark rather than painting ours over it."
          preset="dark"
          width={736}
          dark
        />
        {/* The claim is "sits on any background", so it is checked on the ground
            that actually breaks it: a mid tone, where a white-at-78% fill used
            to read as a slab and a dark fill as a hole. */}
        <Stage
          title="Glass · mid tone, light direction"
          note="The ground that breaks a sheer fill. The card carries its own contrast instead: 16.31:1 body, 5.36:1 provenance."
          preset="glass"
          width={736}
          stage="#6b7570"
        />
        <Stage
          title="Glass · mid tone, dark direction"
          note="Same ground, same preset, the other direction — the host still shows through at 82%."
          preset="glass"
          width={736}
          stage="#6b7570"
          dark
        />

        {/* Side by side, same record, same theme — the only difference is the
            card. Kept on the page because the guard bites the shipped card too
            and this is where that is visible. */}
        <section className="space-y-3">
          <div>
            <h2 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
              The card, before and after
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              Left: the card every shipped layout renders today. Right: the wall
              card. Watch the attribution row on the left — the long role line
              runs past the card edge.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2" style={{ maxWidth: 736 }}>
            {(["before", "after"] as const).map((which) => (
              <div key={which} className="rounded-card bg-surface p-6">
                <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                  {which}
                </p>
                <EmbedTestimonialThemeShell theme={PRESET_TOKENS.card}>
                  <EmbedTestimonialCard
                    item={ITEMS[5]!}
                    profileUrl="/c/example-architecture"
                    quiet={which === "after"}
                  />
                </EmbedTestimonialThemeShell>
              </div>
            ))}
          </div>
        </section>
      </div>
      </main>
    </>
  );
}
