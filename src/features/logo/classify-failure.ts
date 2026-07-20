export type LogoFetchFailureReason =
  | "no-favicon"
  | "timeout"
  | "blocked"
  | "other";

/** Map fetch errors to owner-facing / log reasons. */
export function classifyLogoFetchFailure(error: string): LogoFetchFailureReason {
  const e = error.toLowerCase();
  if (e.includes("timeout") || e.includes("aborted") || e.includes("timed out")) {
    return "timeout";
  }
  if (
    e.includes("private") ||
    e.includes("only https") ||
    e.includes("host must") ||
    e.includes("did not resolve") ||
    e.includes("blocked")
  ) {
    return "blocked";
  }
  if (
    e.includes("no usable logo") ||
    e.includes("no valid website") ||
    e.includes("favicon")
  ) {
    return "no-favicon";
  }
  return "other";
}
