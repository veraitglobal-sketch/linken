import { Button } from "@/components/ui/button";
import { HomeIntegrationsMarquee } from "@/components/marketing/home-integrations-marquee";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

/**
 * Integrations — light split, no plate. Copy left, circulating marks right.
 * Only ships what Hansala actually wires today.
 */
export function HomeIntegrations() {
  return (
    <HomeSection>
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <HomeEyebrow>Integrations</HomeEyebrow>
          <h2 className="mt-5 max-w-[12ch] font-display text-chapter text-ink text-balance">
            API-first by design.
          </h2>
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
            Bookings via Calendly or Cal.com on your profile. Drive the same
            record from Cursor or Claude over MCP. Alerts via webhooks —
            including Slack Incoming Webhooks.
          </p>
          <div className="mt-7">
            <Button
              href="/developers"
              variant="secondary"
              className="h-11 min-w-[200px] px-5"
            >
              Explore the Agent API →
            </Button>
          </div>
        </div>

        <HomeIntegrationsMarquee />
      </div>
    </HomeSection>
  );
}
