import { LinkPreviewCard } from "@/components/marketing/link-preview-card";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

/** Homepage §6a — share moment: one link carries the confirmed network. */
export function HomeTalks() {
  return (
    <HomeSection tone="mute">
      <div className="mx-auto max-w-6xl">
        {/* This section is about one link travelling outward, so the
            composition travels too: the words hold the left edge and the flow
            runs off to the right, sharing their baseline. Every other section
            stacks headline-over-content; repeating that here would make the
            page one template applied twelve times. */}
        {/* Headline takes the full measure so it breaks on its own sentence
            instead of the column edge; the row beneath stays asymmetric so the
            section still does not look like the rest of the page. */}
        <div className="reveal max-w-4xl">
          <HomeEyebrow>The share moment</HomeEyebrow>
          <h2 className="mt-5 font-display text-chapter text-ink">
            Send one link. Bring the whole team.
          </h2>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <p className="max-w-[32ch] text-lead text-muted">
            Confirmed partners and projects travel with every proposal, pitch,
            and introduction — the same facts, wherever you send them.
          </p>

          {/* The unfurl, not a draggable graph: this section is about a link
              travelling, and the artifact of that is what the recipient sees
              when it lands. */}
          <div className="reveal-late flex min-w-0 justify-start lg:justify-end">
            <LinkPreviewCard />
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
