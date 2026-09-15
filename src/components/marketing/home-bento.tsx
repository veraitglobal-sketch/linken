import type { ReactNode } from "react";
import {
  ArtEarned,
  ArtNetwork,
  ArtNoFile,
  ArtOwnSite,
  ArtPrivate,
  ArtTools,
} from "@/components/marketing/home-bento-art";
import {
  HomeBand,
  HomePill,
  HomeTitle,
} from "@/components/marketing/home-section";
import { cn } from "@/lib/cn";

/**
 * Homepage §8 — six tinted cards, each with a line illustration of its idea
 * (see home-bento-art.tsx).
 */
export function HomeBento() {
  return (
    <HomeBand>
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center">
          <HomeTitle>Strict where it counts. Simple everywhere else.</HomeTitle>
          <p className="mx-auto mt-6 max-w-[60ch] text-[18px] leading-relaxed text-ink-soft">
            The rules that make a record mean something, and nothing that gets
            in your way.
          </p>
        </div>

        <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          <Card
            tone="bg-lime-soft"
            title="Private until they confirm"
            body="You add a partner and they sit on your map as pending. Nobody else sees them until the other side clicks."
          >
            <div className="-mx-7 w-[calc(100%+3.5rem)]">
              <ArtPrivate />
            </div>
          </Card>

          <Card
            tone="bg-lime"
            title="Earned, not bought"
            body="The mark means domain proof and mutual confirmation. There is no price that buys it on either plan."
          >
            <div className="-mx-7 w-[calc(100%+3.5rem)]">
              <ArtEarned />
            </div>
          </Card>

          <Card
            tone="bg-lime-soft"
            title="One link carries the network"
            body="Every confirmed partner travels with the proposal or pitch you send."
          >
            <div className="-mx-7 w-[calc(100%+3.5rem)]">
              <ArtNetwork />
            </div>
          </Card>

          <Card
            tone="bg-lime"
            title="On your own site"
            body="The same confirmed records, rendered on your page. Colour and type can match your site; the mark stays ours."
          >
            <div className="-mx-7 w-[calc(100%+3.5rem)]">
              <ArtOwnSite />
            </div>
          </Card>

          <Card
            tone="bg-lime-soft"
            title="No file is not a mark"
            body="Look up any company. You find confirmed records, or nothing — and a new company can always start."
          >
            <div className="-mx-7 w-[calc(100%+3.5rem)]">
              <ArtNoFile />
            </div>
          </Card>

          <Card
            tone="bg-lime"
            title="In the tools you use"
            body="Bookings from Calendly or Cal.com, alerts in Slack, and the same record driven from Cursor or Claude."
          >
            <div className="-mx-7 w-[calc(100%+3.5rem)]">
              <ArtTools />
            </div>
          </Card>
        </div>

        <div className="mt-12 flex justify-center">
          <HomePill href="/onboarding">Create your free profile</HomePill>
        </div>
      </div>
    </HomeBand>
  );
}

function Card({
  tone,
  title,
  body,
  children,
}: {
  tone: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <article
      className={cn(
        "flex min-h-[449px] flex-col overflow-hidden rounded-3xl px-7 pt-7",
        tone,
      )}
    >
      <h3 className="font-display text-[24px] leading-tight font-semibold tracking-[-0.025em] text-ink">
        {title}
      </h3>
      <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">{body}</p>
      <div className="mt-auto flex items-end pt-8">{children}</div>
    </article>
  );
}
