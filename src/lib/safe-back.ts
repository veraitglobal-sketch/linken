/** Allow return to workspace or public company surfaces. */
export function safeAppBack(raw: string, fallback: string) {
  const back = raw.trim();
  if (
    back.startsWith("/dashboard") ||
    back.startsWith("/search") ||
    back.startsWith("/c/") ||
    back.startsWith("/g/") ||
    back.startsWith("/welcome")
  ) {
    return back;
  }
  return fallback;
}

/** Merge query params onto a path that may already include ? or #. */
export function withBackQuery(back: string, params: Record<string, string>) {
  const hashIdx = back.indexOf("#");
  const pathPart = (hashIdx >= 0 ? back.slice(0, hashIdx) : back) || "/";
  const hash = hashIdx >= 0 ? back.slice(hashIdx) : "";
  const url = new URL(pathPart, "http://linken.local");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return `${url.pathname}${url.search}${hash}`;
}
