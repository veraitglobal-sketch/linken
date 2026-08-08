import { ShareMomentGraph } from "@/components/marketing/share-moment-graph";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

/** Homepage §6a — share moment: one link carries the confirmed network. */
export function HomeTalks() {
  return (
    <HomeSection tone="mute" className="!py-16 sm:!py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <HomeEyebrow className="text-center">
            The share moment
          </HomeEyebrow>
          <h2 className="mt-5 font-display text-chapter text-ink text-balance">
            Send one link.
            <span className="mt-2 block text-ink/30">
              Bring the whole team.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted">
            Confirmed partners and projects travel with every proposal, pitch,
            and introduction — the same facts, wherever you send them.
          </p>
        </div>
        <ShareMomentGraph />
      </div>
    </HomeSection>
  );
}
