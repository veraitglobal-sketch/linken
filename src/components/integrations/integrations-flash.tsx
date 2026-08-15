type Props = {
  error?: string;
  connected?: string;
  saved?: string;
  disconnected?: string;
};

export function IntegrationsFlash({
  error,
  connected,
  saved,
  disconnected,
}: Props) {
  if (error) {
    return (
      <p className="mb-5 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
        {error}
      </p>
    );
  }
  if (connected === "slack") {
    return (
      <p className="mb-5 rounded-2xl border border-[#1a5c51]/30 bg-[#1a5c51]/10 px-4 py-3 text-sm text-ink">
        Slack connected. Confirmations and inquiries will post to your channel.
      </p>
    );
  }
  if (connected) {
    return (
      <p className="mb-5 rounded-2xl border border-[#1a5c51]/30 bg-[#1a5c51]/10 px-4 py-3 text-sm text-ink">
        Connected {connected === "calendly" ? "Calendly" : "Cal.com"}. Book a
        call is live on your company profile.
      </p>
    );
  }
  if (saved) {
    return (
      <p className="mb-5 rounded-2xl border border-[#1a5c51]/30 bg-[#1a5c51]/10 px-4 py-3 text-sm text-ink">
        Booking link saved. Visitors can book from your profile.
      </p>
    );
  }
  if (disconnected) {
    return (
      <p className="mb-5 rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink">
        Scheduling disconnected.
      </p>
    );
  }
  return null;
}
