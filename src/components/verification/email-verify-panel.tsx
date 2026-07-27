"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmailAddressPicker } from "@/components/verification/email-address-picker";
import { checkEmailDomainVerification } from "@/features/verification/actions";
import { sendDomainVerificationEmailAction } from "@/features/verification/email-verification-actions";
import { domainsMatch } from "@/features/verification/domain";
import type { DiscoveredEmail } from "@/features/verification/email-discovery";

type Props = {
  domain: string | null;
  mail: string | null;
  website: string;
  ownerEmail: string;
  lockDomain: string | null;
  roleOnly: boolean;
  sentTo?: string | null;
  initialAddresses?: DiscoveredEmail[];
  discoveryError?: string;
};

export function EmailVerifyPanel({
  domain,
  mail,
  website,
  ownerEmail,
  lockDomain,
  roleOnly,
  sentTo,
  initialAddresses = [],
  discoveryError,
}: Props) {
  const shortcut = domainsMatch(website, ownerEmail);
  const [picked, setPicked] = useState(initialAddresses[0]?.email ?? "");
  const [localPart, setLocalPart] = useState("");

  if (shortcut.ok) {
    return (
      <div className="space-y-4">
        <p className="text-[13px] leading-relaxed text-muted">
          Your login email matches an allowed domain for{" "}
          <span className="font-mono text-ink">{domain}</span>
          {mail ? (
            <>
              {" "}
              (<span className="font-mono">{mail}</span>)
            </>
          ) : null}
          .
        </p>
        <form action={checkEmailDomainVerification}>
          <Button type="submit" className="h-10 px-5">
            Verify domain
          </Button>
        </form>
      </div>
    );
  }

  const suffix = lockDomain ?? domain ?? "your-domain";
  const addresses = initialAddresses;

  return (
    <div className="space-y-5">
      <p className="text-[13px] leading-relaxed text-muted">
        Pick a mailbox on your domain or enter one manually. We send a
        one-time link — valid for 60 minutes. DNS TXT and Meta / file remain
        available in the other tabs.
      </p>

      {roleOnly ? (
        <p className="rounded-xl border border-line bg-paper/50 px-3.5 py-2.5 text-[12px] text-muted">
          This profile was created by a partner. Use a role address (info@,
          kontakt@, admin@, …) — not a personal mailbox.
        </p>
      ) : null}

      {sentTo ? (
        <p className="rounded-xl border border-blue/25 bg-blue/10 px-3.5 py-2.5 text-[13px] text-ink">
          Verification email sent to{" "}
          <span className="font-mono font-semibold">{sentTo}</span>. Open the
          link in that inbox to finish.
        </p>
      ) : null}

      {discoveryError ? (
        <p className="rounded-xl border border-ember/25 bg-ember/10 px-3.5 py-2.5 text-[13px] text-ink">
          {discoveryError}
        </p>
      ) : null}

      {addresses.length > 0 ? (
        <EmailAddressPicker
          addresses={addresses}
          picked={picked}
          onPick={setPicked}
        />
      ) : (
        <div className="space-y-2">
          <p className="text-[12px] font-semibold text-ink">
            Enter an address on your domain
          </p>
          <div className="flex max-w-md items-center gap-1 rounded-xl border border-line bg-paper/60 px-3 py-2">
            <input
              name="local_part"
              value={localPart}
              onChange={(e) => setLocalPart(e.target.value)}
              placeholder="info"
              className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-ink outline-none"
              autoComplete="off"
            />
            <span className="shrink-0 font-mono text-[13px] text-muted">
              @{suffix}
            </span>
          </div>
        </div>
      )}

      <form action={sendDomainVerificationEmailAction} className="space-y-3">
        <input type="hidden" name="picked_email" value={picked} />
        {addresses.length === 0 ? (
          <input type="hidden" name="local_part" value={localPart} />
        ) : null}
        <Button
          type="submit"
          className="h-10 px-5"
          disabled={!picked && !localPart.trim()}
        >
          Send verification email
        </Button>
      </form>
    </div>
  );
}
