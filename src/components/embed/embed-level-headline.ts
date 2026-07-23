import type { TrustLevel } from "@/features/trust/score";

/** Trustpilot-style headline — one word, not five icons. */
export function levelHeadline(level: TrustLevel, verified: boolean): string {
  if (level === "Pillar") return "Pillar";
  if (level === "Trusted") return "Trusted";
  if (level === "Established") return "Established";
  if (verified) return "Verified";
  return "Profile";
}

export function levelSubline(level: TrustLevel): string | null {
  if (level === "Pillar") return "Top of the Hansala network";
  if (level === "Trusted") return "Confirmed by partners & clients";
  if (level === "Established") return "Building confirmed proof";
  return null;
}
