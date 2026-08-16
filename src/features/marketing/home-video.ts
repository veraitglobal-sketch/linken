/** Homepage outcomes — muted loop on-page; click opens YouTube lightbox. */
export const HOME_VIDEO = {
  /** Drop the file at public/videos/home-proof.mp4 */
  src: "/videos/home-proof.mp4",
  poster: "/images/hero-plate.webp",
  /**
   * Watch or share URL, or embed id. Examples:
   * https://www.youtube.com/watch?v=xxxx
   * https://youtu.be/xxxx
   */
  youtubeUrl: "https://www.youtube.com/watch?v=ghjeARUQ3yM",
  title: "How Hansala works",
  label: "Watch how it works",
} as const;

/** Extract 11-char YouTube id from common URL shapes. */
export function youtubeIdFromUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^[\w-]{11}$/.test(v)) return v;
  try {
    const u = new URL(v);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    const vParam = u.searchParams.get("v");
    if (vParam && /^[\w-]{11}$/.test(vParam)) return vParam;
    const parts = u.pathname.split("/").filter(Boolean);
    const embedIdx = parts.indexOf("embed");
    if (embedIdx >= 0 && parts[embedIdx + 1] && /^[\w-]{11}$/.test(parts[embedIdx + 1])) {
      return parts[embedIdx + 1];
    }
  } catch {
    return null;
  }
  return null;
}
