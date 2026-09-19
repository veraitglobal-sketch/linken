/**
 * Who may press Confirm. The email on the invite is routing, not auth —
 * the token is the capability. The sender may never confirm their own record.
 */
export function confirmResponderGate(input: {
  userId: string | null;
  companyId: string | null;
  senderCompanyId: string;
}): "auth" | "sender" | "ok" {
  if (!input.userId) return "auth";
  if (input.companyId && input.companyId === input.senderCompanyId) {
    return "sender";
  }
  return "ok";
}

export function suggestedConfirmCompanyName(
  clientName?: string | null,
  email?: string | null,
): string {
  const named = clientName?.trim();
  if (named) return named;
  const local = (email ?? "").split("@")[0]?.replace(/[._+-]+/g, " ").trim();
  return local || "Company";
}

export function confirmRpcMessage(raw: string): string {
  if (/not authenticated/i.test(raw)) {
    return "Sign in again, then open this confirmation link.";
  }
  if (/not company owner/i.test(raw)) {
    return "Only the company owner can confirm this request.";
  }
  if (/expired/i.test(raw)) {
    return "This confirmation link has expired.";
  }
  if (/already resolved|not found/i.test(raw)) {
    return "This request is no longer pending. Open the original email link, or ask them to send a new invite.";
  }
  return raw.trim() || "Could not respond.";
}
