import { ShareMomentGraph } from "@/components/marketing/share-moment-graph";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

export function HomeTalks() {
  return (
    <HomeSection>
      <div className="mx-auto max-w-4xl text-center">
        <HomeEyebrow className="text-center">The share moment</HomeEyebrow>
        <h2 className="mt-5 font-display text-[clamp(2.4rem,6.2vw,4.4rem)] font-medium leading-[1.06] tracking-[-0.052em] text-ink">
          Send one link.
          <span className="mt-2 block text-ink/25">Bring the whole team.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Your confirmed network travels with every proposal, pitch, and
          introduction.
        </p>
        <ShareMomentGraph />
      </div>
    </HomeSection>
  );
}
