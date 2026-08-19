/**
 * Placeholder values that came straight from `.env.example`.
 *
 * `required()` only ever caught an *empty* variable, so a copied-but-unedited
 * `.env.local` sailed through: `YOUR_PROJECT_REF.supabase.co` is a perfectly
 * non-empty string. Every call then failed far away with `TypeError: fetch
 * failed`, and because `getCompanyForPage` turns any failure into `null`, the
 * product answered "Company not found" for companies that plainly exist. Hours
 * were spent on that; the fix is to refuse the placeholder here, once, loudly.
 */
const PLACEHOLDER = /YOUR_|<[a-z-]+>|change[_-]?me|example\.supabase\.co/i;

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  if (PLACEHOLDER.test(value)) {
    throw new Error(
      `${name} is still the placeholder from .env.example. ` +
        `Put your real Supabase values in .env.local (Project Settings → API) ` +
        `and restart the dev server — Next reads .env.local only at startup.`,
    );
  }
  return value;
}

export function getSupabaseEnv() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}
