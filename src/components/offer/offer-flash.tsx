import { WidgetsFlash } from "@/components/widgets/widgets-flash";

const FLASH: Record<string, string> = {
  success:
    "Welcome to Pro. Embeds, analytics, Agent API, and team seats are active.",
  canceled: "Checkout canceled. No charge was made.",
  stripe_not_configured: "This offer is not available to buy yet.",
  owner_only: "Only the company owner can buy Pro.",
  already_pro: "This company is already on a paid plan.",
  checkout_failed: "Could not start checkout. Try again or contact support.",
  invalid: "That offer is not available.",
};

export function OfferFlash({
  success,
  canceled,
  error,
}: {
  success?: string;
  canceled?: string;
  error?: string;
}) {
  const key = success ? "success" : canceled ? "canceled" : error;
  const message = key ? FLASH[key] : null;
  if (!message) return null;
  return (
    <div className="mt-8">
      <WidgetsFlash tone={error ? "error" : undefined}>{message}</WidgetsFlash>
    </div>
  );
}