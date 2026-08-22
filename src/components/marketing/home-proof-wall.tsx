import { Button } from "@/components/ui/button";
import { EmbedTestimonialCard } from "@/components/embed/embed-testimonial-card";
import { EmbedTestimonialsWall } from "@/components/embed/embed-testimonials-wall";
import { EmbedTestimonialThemeShell } from "@/components/embed/embed-testimonial-theme-shell";
import { HomeEyebrow, HomeSection } from "@/components/marketing/home-section";
import { PRESET_TOKENS, type TestimonialThemeTokens } from "@/features/testimonials/theme/presets";
import type { PublicTestimonial } from "@/features/testimonials/types";

/**
 * The many, and the one.
 *
 * The composition is deliberately lopsided: a still left rail holding a single
 * record you can read to the end, against a right side where more records than
 * fit keep arriving. That asymmetry is the argument — one is inspectable, and
 * there are more than we can show you at once.
 *
 * Both sides render `EmbedTestimonialCard`, the component a customer's own site
 * renders. The left one is the same card with a transparent theme, not a second
 * design of the same thing, so the page can never drift from the widget.
 *
 * Nothing here fetches. Records arrive as props: a marketing page that depends
 * on runtime data renders a 404 document mid-section the day the record moves.
 */

type Props = {
  /** The one to read. Rendered in full, provenance and all. */
  feature: PublicTestimonial;
  /** The rest, in motion. */
  wall: PublicTestimonial[];
  profileUrl: string;
};

/* The host here is Hansala, so the widget inherits Hansala's face rather than
   the serif every preset ships with for other people's sites. */
const WALL_THEME: TestimonialThemeTokens = {
  ...PRESET_TOKENS.card,
  fontFamily: "var(--font-ui)",
  /* 16, not 15. Clerk's body sets at 16 and the extra pixel is most of why
     their card reads as something to read rather than something to scan. */
  fontSize: 16,
  /* 14, not 20. A 20px radius on a 340px card reads soft and friendly; the
     crispness that reads as premium comes from a tighter corner against a
     half-pixel ring. The `card` preset already ships 14 — the override to 20
     was mine, borrowed from Hansala's own big surfaces, where it belongs. */
  radius: 14,
  spacing: 22,
  /* The shadow's half-pixel ring is the edge now. Keeping the border as well
     would draw two, a hairline inside a hairline. */
  borderWidth: 0,
  borderColor: "rgba(13,18,16,0.10)",
};

const FEATURE_THEME: TestimonialThemeTokens = {
  ...WALL_THEME,
  fontSize: 17,
  cardBackground: "transparent",
  borderColor: "transparent",
  borderWidth: 0,
  radius: 0,
  shadow: "none",
  spacing: 0,
};

export function HomeProofWall({ feature, wall, profileUrl }: Props) {
  return (
    /* The ground the cards need: a near-white band under pure-white cards.
     *
     * This used to force `#f4f6f4` locally, because `--mute` and `--paper` were
     * both `#ffffff` and the band did not exist. `--mute` is now `#f0f2f0` — the
     * design language's own paper — so the tone carries it and the local
     * override is gone. Two greys four units apart on one site read as a
     * mistake, not as a rhythm. */
    <HomeSection tone="mute">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:gap-20">
        <div className="reveal">
          <HomeEyebrow>Written by the other side</HomeEyebrow>
          <h2 className="mt-5 font-display text-chapter text-ink text-balance">
            Not one of these is ours to write.
          </h2>
          <p className="mt-5 max-w-[34ch] text-lead text-muted">
            Every quote here was written by the company that received the work,
            and appears only after that company confirmed it. Neither we nor the
            company being praised can edit a word.
          </p>

          <div className="mt-8">
            <Button href="/onboarding" className="h-12 px-6">
              Create your free profile
            </Button>
          </div>

          {/* The one record, given room. Same card, theme stripped back — on a
              rail this narrow a border would fence off the quote from the copy
              above it, and the two are meant to read as one column.

              The label is doing real work: without it the eye reads headline,
              paragraph, button, and then another paragraph, and the only real
              record on the page arrives with less weight than the marketing
              copy above it. Naming it makes it an exhibit. */}
          <div className="mt-10 border-t border-line pt-8">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              One, in full
            </p>
            {/* The glyph the wall cards deliberately do not have. On a card it is
                ornament repeated forty times; here it is the one signal that the
                block below is somebody else's voice and not more of our copy. */}
            {/* Tight to the card below it. The provenance stamp now sits at the
                head of the card, so the glyph and the stamp both introduce the
                quote — with air between them they read as two separate openings
                instead of one. */}
            <span
              aria-hidden
              className="mt-4 block font-display text-[4.5rem] leading-[0.44] font-medium text-ink/15 select-none"
            >
              “
            </span>
            <div className="mt-1">
              <EmbedTestimonialThemeShell theme={FEATURE_THEME}>
                <EmbedTestimonialCard
                  item={feature}
                  profileUrl={feature.profileUrl}
                  quiet
                />
              </EmbedTestimonialThemeShell>
            </div>
          </div>
        </div>

        {/* The texture the wall stands on, over and above the band.
            The grid gives the section a floor without inventing a colour: it is
            ink at 8%, on the same 20px rhythm
            as the card radius, and it dissolves at all four edges so it reads as
            texture rather than as a panel with a border. */}
        <div className="reveal-late relative min-w-0">
          <span
            aria-hidden
            /* The bleed is desktop-only. At 390 the column is the full page
               width, so 32px each side overflowed the page padding by 8 and the
               body scrolled sideways. */
            className="pointer-events-none absolute inset-x-0 -inset-y-6 lg:-inset-x-8"
            style={{
              /* Three layers on one 20px grid. The tinted sizes are multiples of
                 it and the offsets are too, so a mint or teal dot always lands
                 exactly on a node — it reads as some of the grid being coloured
                 rather than as a second pattern laid over the first.
                 Both tints are ours: `--blue-soft` and `--blue`. Clerk's grid is
                 violet and cyan because that is Clerk's palette; borrowing it
                 would put a colour on the page that exists nowhere else in the
                 product. Worth a second opinion that mint is spread this thin —
                 AGENTS.md keeps it for the mark and one accent, and this is
                 texture rather than an accent, which is a reading, not a rule. */
              /* Finer and denser, but more saturated — a smaller dot at a higher
                 alpha reads as sharper rather than heavier, where a bigger dot
                 at a low alpha just reads as smudge. The grid drops to 12px so
                 the texture runs through every gap between cards instead of
                 only the wide ones.
                 The tinted layers stay exact multiples of 12 with offsets that
                 are multiples of 12, so every coloured dot still lands on a node
                 of the base grid: one grid, some of it in colour. */
              backgroundImage: [
                "radial-gradient(circle at 1px 1px, rgba(126,184,164,0.95) 0.75px, transparent 0)",
                "radial-gradient(circle at 1px 1px, rgba(26,92,81,0.6) 0.7px, transparent 0)",
                "radial-gradient(circle at 1px 1px, rgba(13,18,16,0.16) 0.6px, transparent 0)",
              ].join(","),
              backgroundSize: "60px 48px, 84px 72px, 12px 12px",
              backgroundPosition: "24px 12px, 48px 36px, 0 0",
              maskImage:
                "radial-gradient(120% 80% at 50% 50%, #000 35%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(120% 80% at 50% 50%, #000 35%, transparent 100%)",
            }}
          />
          <div className="relative">
            <EmbedTestimonialThemeShell theme={WALL_THEME}>
              <EmbedTestimonialsWall
                items={wall}
                profileUrl={profileUrl}
                maxColumns={WALL_THEME.maxColumns}
                height={600}
              />
            </EmbedTestimonialThemeShell>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
