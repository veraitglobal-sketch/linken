/** Supabase (and a few providers) when the work email already has an account. */
export function isExistingAccountError(message: string) {
  return /already (been )?registered|user already exists|email already/i.test(
    message,
  );
}

/** Human line for a failed sign-up. Auth sometimes returns `msg` with no `message`. */
export function signupErrorMessage(error: {
  message?: string | null;
  msg?: string | null;
  code?: string | null;
  name?: string | null;
  status?: number | null;
}): string {
  const text = String(error.message ?? error.msg ?? "").trim();
  const mailFailed =
    /confirmation email/i.test(text) ||
    error.code === "unexpected_failure" ||
    error.name === "AuthRetryableFetchError";
  if (mailFailed) {
    return "We could not send the confirmation email. Try again in a minute.";
  }
  if (text && text !== "{}" && text !== "[object Object]") return text;
  return "Could not create the account. Try again.";
}
