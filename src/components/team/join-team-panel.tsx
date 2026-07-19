"use client";

import { useState } from "react";
import { InviteAuth } from "@/components/auth/invite-auth";
import { respondTeamInvitation } from "@/features/team/actions";
import type { TeamInvitePreview } from "@/features/team/types";
import { Button } from "@/components/ui/button";

type Props = {
  preview: TeamInvitePreview;
  token: string;
  userId: string | null;
  error?: string;
  declined?: boolean;
};

export function JoinTeamPanel({
  preview,
  token,
  userId,
  error,
  declined,
}: Props) {
  const [step, setStep] = useState<"review" | "consent">("review");
  const [publicVisible, setPublicVisible] = useState(false);
  const next = `/join/${token}`;

  if (declined || preview.status === "declined") {
    return (
      <Status
        title="Invite declined"
        body="You declined this team invitation. Nothing was added."
      />
    );
  }

  if (preview.status === "accepted") {
    return (
      <Status
        title="Already joined"
        body="This invite was already accepted. Open your dashboard to manage your team card."
      />
    );
  }

  if (preview.status === "cancelled" || preview.status !== "pending") {
    return (
      <Status
        title="Invite unavailable"
        body="This invite link is invalid, cancelled, or already closed."
      />
    );
  }

  if (!userId) {
    return (
      <InviteAuth
        next={next}
        invitedEmail={preview.inviteEmail}
        title="Sign in to join the team"
        description={`${preview.inviterHint} invited you to ${preview.companyName}. Sign in with the invited email to continue.`}
      />
    );
  }

  if (step === "review") {
    return (
      <div className="rounded-[24px] border border-line bg-surface px-5 py-6 sm:px-7">
        {error ? (
          <p className="mb-4 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
            {error}
          </p>
        ) : null}
        <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
          Team invite
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
          Join {preview.companyName}
        </h2>
        <p className="mt-2 text-[14px] text-ink-soft">
          You&apos;re joining as{" "}
          <span className="font-semibold text-ink">
            {preview.inviteTitle || preview.inviteName}
          </span>
          {" · "}
          role <span className="font-semibold text-ink">{preview.role}</span>.
        </p>
        <p className="mt-1 text-[13px] text-muted">
          Invited by {preview.inviterHint}
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            className="h-11 flex-1"
            onClick={() => setStep("consent")}
          >
            Join team
          </Button>
          <form action={respondTeamInvitation} className="sm:w-auto">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="decision" value="declined" />
            <Button type="submit" variant="ghost" className="h-11 w-full sm:w-auto">
              Decline
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-6 sm:px-7">
      {error ? (
        <p className="mb-4 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Public visibility
      </p>
      <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        Show me on the public company profile?
      </h2>
      <p className="mt-2 text-[14px] text-ink-soft">
        Only you decide. If enabled, visitors see your name, title, and photo on{" "}
        {preview.companyName}&apos;s public page. Default is off.
      </p>

      <form
        action={respondTeamInvitation}
        className="mt-6 space-y-5"
        encType="multipart/form-data"
      >
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="decision" value="accepted" />
        <input
          type="hidden"
          name="public_visible"
          value={publicVisible ? "1" : "0"}
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-4 py-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={publicVisible}
            onChange={(e) => setPublicVisible(e.target.checked)}
          />
          <span>
            <span className="block text-[13px] font-semibold text-ink">
              Show on public profile
            </span>
            <span className="mt-0.5 block text-[12px] text-muted">
              Displays name, title, and photo. No personal page is created.
            </span>
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Photo (optional)
          </span>
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-[13px] text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-[#f4f6f8] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-ink"
          />
        </label>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" className="h-11 flex-1">
            Finish
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            onClick={() => setStep("review")}
          >
            Back
          </Button>
        </div>
      </form>
    </div>
  );
}

function Status({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-8 text-center sm:px-7">
      <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[14px] text-ink-soft">{body}</p>
    </div>
  );
}
