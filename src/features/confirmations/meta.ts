/** Confirmation depth + public disclosure (client-set at confirm time). */

export type ConfirmationLevel = 1 | 2 | 3;
export type ConfirmationDisclosure = "named" | "undisclosed";

export const UNDISCLOSED_CLIENT_LABEL = "Undisclosed client";

export function parseConfirmationLevel(raw: unknown): ConfirmationLevel | null {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (n === 1 || n === 2 || n === 3) return n;
  return null;
}

export function parseDisclosure(raw: unknown): ConfirmationDisclosure | null {
  if (raw === "named" || raw === "undisclosed") return raw;
  return null;
}

/** L1 = confirm click; optional checkboxes raise to L2/L3. */
export function levelFromConfirmForm(formData: FormData): ConfirmationLevel {
  if (String(formData.get("level_outcome") ?? "") === "1") return 3;
  if (String(formData.get("level_scope") ?? "") === "1") return 2;
  return 1;
}

export function disclosureFromConfirmForm(
  formData: FormData,
): ConfirmationDisclosure {
  const d = String(formData.get("disclosure") ?? "named").trim();
  return d === "undisclosed" ? "undisclosed" : "named";
}

export function isUndisclosedPublic(
  disclosure: ConfirmationDisclosure | null | undefined,
): boolean {
  return disclosure === "undisclosed";
}

export function confirmationLevelLabel(level: ConfirmationLevel | null | undefined) {
  if (level === 3) return "Outcome";
  if (level === 2) return "Scope";
  return null;
}
