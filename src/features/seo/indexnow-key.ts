import "server-only";

/** 8–128 hex chars — IndexNow key file content and query `key`. */
const KEY_RE = /^[a-f0-9]{8,128}$/i;

export function indexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key || !KEY_RE.test(key)) return null;
  return key.toLowerCase();
}

export function isIndexNowConfigured() {
  return Boolean(indexNowKey());
}
