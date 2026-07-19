import Link from "next/link";
import { updateSocialLinks } from "@/features/company/social-actions";
import { setAcceptingClients } from "@/features/company/actions";
import {
  cancelOwnershipTransfer,
  requestOwnershipTransfer,
} from "@/features/ownership/actions";
import type { PendingOwnershipTransfer } from "@/features/ownership/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialIcons } from "@/components/ui/social-icons";

type Props = {
  company: {
    id: string;
    name: string;
    slug: string;
    acceptingClients: boolean;
  };
  linkedinUrl: string;
  facebookUrl: string;
  socialSaved: boolean;
  pendingTransfer: PendingOwnershipTransfer | null;
};

export function DashboardAside({
  company,
  linkedinUrl,
  facebookUrl,
  socialSaved,
  pendingTransfer,
}: Props) {
  return (
    <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
      <nav aria-label="Workspace links">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          Open
        </p>
        <ul className="mt-3 space-y-1 border-l border-line pl-3">
          {[
            { href: "/dashboard", label: "Overview & graph" },
            { href: "/dashboard/structure", label: "Company tree" },
            { href: "/dashboard/inbox", label: "Inquiries" },
            {
              href: `/c/${company.slug}#network-map`,
              label: "Public network map",
            },
            { href: `/c/${company.slug}/one-pager`, label: "One-pager" },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1f6b5c] uppercase">
          Availability
        </p>
        <p className="mt-2 font-display text-[17px] font-medium tracking-[-0.03em] text-ink">
          {company.acceptingClients
            ? "Accepting new clients"
            : "Fully booked"}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <form action={setAcceptingClients}>
            <input type="hidden" name="accepting_clients" value="true" />
            <Button
              type="submit"
              variant={company.acceptingClients ? "primary" : "secondary"}
              className="h-10 w-full"
            >
              Accepting clients
            </Button>
          </form>
          <form action={setAcceptingClients}>
            <input type="hidden" name="accepting_clients" value="false" />
            <Button
              type="submit"
              variant={!company.acceptingClients ? "primary" : "secondary"}
              className="h-10 w-full"
            >
              Fully booked
            </Button>
          </form>
        </div>
      </div>

      <div id="social">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1f6b5c] uppercase">
            Social
          </p>
          <SocialIcons
            linkedinUrl={linkedinUrl || null}
            facebookUrl={facebookUrl || null}
            tone="light"
          />
        </div>
        {socialSaved ? (
          <p className="mt-2 text-[12px] font-medium text-[#1f6b5c]">
            Links saved.
          </p>
        ) : null}
        <form action={updateSocialLinks} className="mt-3 space-y-2.5">
          <Input
            name="linkedin_url"
            type="url"
            defaultValue={linkedinUrl}
            placeholder="LinkedIn URL"
            aria-label="LinkedIn URL"
          />
          <Input
            name="facebook_url"
            type="url"
            defaultValue={facebookUrl}
            placeholder="Facebook URL"
            aria-label="Facebook URL"
          />
          <Button type="submit" variant="secondary" className="h-10 w-full">
            Save links
          </Button>
        </form>
      </div>

      <div className="border-t border-line pt-6">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          Ownership
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
          Transfer {company.name} to a new owner. Trust and references stay with
          the company.
        </p>
        {pendingTransfer ? (
          <div className="mt-3">
            <p className="text-[13px] text-ink">
              Pending →{" "}
              <span className="font-medium">{pendingTransfer.inviteEmail}</span>
            </p>
            <form action={cancelOwnershipTransfer} className="mt-2">
              <input type="hidden" name="company_id" value={company.id} />
              <Button type="submit" variant="secondary" className="h-10">
                Cancel transfer
              </Button>
            </form>
          </div>
        ) : (
          <form
            action={requestOwnershipTransfer}
            className="mt-3 space-y-2.5"
          >
            <input type="hidden" name="company_id" value={company.id} />
            <Input
              name="invite_email"
              type="email"
              required
              placeholder="new-owner@company.com"
              aria-label="New owner email"
            />
            <Button type="submit" variant="secondary" className="h-10 w-full">
              Send transfer
            </Button>
          </form>
        )}
      </div>
    </aside>
  );
}
