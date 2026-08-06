import "server-only";

export {
  PRO_PLAN_LABEL,
  PRO_PLAN_PRICE,
  PRO_HIGHLIGHTS as PRO_FEATURES,
} from "@/features/plan/pricing";

export function proPriceId(): string | null {
  const id = process.env.STRIPE_PRICE_PRO_MONTHLY?.trim();
  return id || null;
}
