import { ConfirmDrop } from "@/components/marketing/confirm-drop";
import { HomeSection } from "@/components/marketing/home-section";

export function HomeIconLine() {
  return (
    <HomeSection tone="mute" className="!py-24 sm:!py-32">
      <div className="mx-auto max-w-3xl">
        <ConfirmDrop />
        <p className="mt-10 max-w-sm text-[14px] leading-relaxed text-ink-soft/90 sm:mt-12">
          Not a claim. A record both sides signed.
        </p>
      </div>
    </HomeSection>
  );
}
