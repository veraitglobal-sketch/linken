const MAX_URI_LENGTH = 500;
const MAX_URIS = 5;

/** RFC 7591 redirect_uri: https, or http on loopback. No fragments. */
export function isAllowedRedirectUri(raw: string): boolean {
  if (!raw || raw.length > MAX_URI_LENGTH) return false;
  if (raw.includes("#")) return false;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.username || url.password) return false;
  if (url.protocol === "https:") return true;
  if (url.protocol !== "http:") return false;
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}

export function parseRedirectUris(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_URIS) {
    return null;
  }
  const uris: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") return null;
    const uri = item.trim();
    if (!isAllowedRedirectUri(uri)) return null;
    uris.push(uri);
  }
  return uris;
}

export function redirectUriRegistered(list: string[], candidate: string) {
  return list.includes(candidate);
}
