import { InviteAuth } from "@/components/auth/invite-auth";

type Props = {
  next: string;
  invitedEmail?: string;
};

export function ConfirmAuth({ next, invitedEmail }: Props) {
  return (
    <InviteAuth
      next={next}
      invitedEmail={invitedEmail}
      title="Sign in to respond"
      description="Confirm as the company that received this project."
    />
  );
}
