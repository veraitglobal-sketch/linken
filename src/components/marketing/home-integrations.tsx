import { Button } from "@/components/ui/button";
import { HomeIntegrationsMarquee } from "@/components/marketing/home-integrations-marquee";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

/**
 * Integrations — sits after the live workspace screen.
 * Light split, no plate. Only ships what Hansala actually wires today.
 */
export function HomeIntegrations() {
  return (
    <HomeSection tone="mute">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <HomeEyebrow>Integrations</HomeEyebrow>
          <h2 className="mt-5 max-w-[14ch] font-display text-chapter text-ink text-balance">
            The same record, in the tools you already use.
          </h2>
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
            Bookings via Calendly or Cal.com on your profile. Alerts in your
            Slack — partnership requests can be accepted from the channel. Drive
            the same record from Cursor or Claude over MCP.
          </p>
          <div className="mt-7">
            <Button
              href="/dashboard/integrations"
              variant="secondary"
              className="h-11 min-w-[200px] px-5"
            >
              Open integrations →
            </Button>
          </div>
        </div>

        <HomeIntegrationsMarquee />
      </div>
    </HomeSection>
  );
}
