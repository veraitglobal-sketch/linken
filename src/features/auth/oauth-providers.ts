/**
 * Which social sign-in buttons to show. Off until the provider is configured
 * in Supabase (Authentication → Providers) and the matching flag is set:
 *
 *   NEXT_PUBLIC_AUTH_GOOGLE=1
 *   NEXT_PUBLIC_AUTH_MICROSOFT=1
 */
export function enabledOAuthProviders() {
  return {
    google: process.env.NEXT_PUBLIC_AUTH_GOOGLE === "1",
    microsoft: process.env.NEXT_PUBLIC_AUTH_MICROSOFT === "1",
  };
}
