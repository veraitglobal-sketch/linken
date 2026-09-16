/** Supabase (and a few providers) when the work email already has an account. */
export function isExistingAccountError(message: string) {
  return /already (been )?registered|user already exists|email already/i.test(
    message,
  );
}
