import Link from "next/link";
import { TeamFlash } from "@/components/team/team-flash";

type Params = {
  error?: string;
  invited?: string;
  cancelled?: string;
  joined?: string;
  profileUpdated?: string;
  accessUpdated?: string;
};

export function TeamPageFlashes({
  params,
  needsSetup,
}: {
  params: Params;
  needsSetup?: boolean;
}) {
  return (
    <>
      {params.error ? (
        <TeamFlash tone="error">{params.error}</TeamFlash>
      ) : null}
      {params.invited ? (
        <TeamFlash>
          Invite sent. They become a member only after accepting the link.
        </TeamFlash>
      ) : null}
      {params.cancelled ? <TeamFlash>Invite cancelled.</TeamFlash> : null}
      {params.joined ? (
        <TeamFlash>
          You joined the team. Complete your card under You anytime.
        </TeamFlash>
      ) : null}
      {params.profileUpdated ? <TeamFlash>Profile updated.</TeamFlash> : null}
      {params.accessUpdated ? (
        <TeamFlash>Section access updated.</TeamFlash>
      ) : null}
      {needsSetup ? (
        <TeamFlash>
          Finish your team card — name and title.{" "}
          <Link
            href="/dashboard/team?tab=you"
            className="font-semibold underline-offset-2 hover:underline"
          >
            Open You
          </Link>
        </TeamFlash>
      ) : null}
    </>
  );
}
