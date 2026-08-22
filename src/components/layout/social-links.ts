import type { SocialNetwork } from "@/components/layout/social-mark";

/**
 * Hansala's own accounts.
 *
 * Same shape as `getLegalCompany`: a default in code, overridable per
 * environment, read at render. Following that pattern rather than inventing a
 * second config mechanism for six links.
 *
 * An entry with no URL renders nothing at all. That is deliberate and it is the
 * house rule — where content does not exist we remove the element rather than
 * shipping a placeholder or a guessed handle. A footer link that guesses
 * `linkedin.com/company/hansala` and lands on somebody else's page is worse
 * than no link, and worst of all on a product whose subject is verification.
 */

export type SocialLink = {
  network: SocialNetwork;
  url: string;
};

/** Order is the row order. Networks with no URL are dropped, not greyed out. */
const ORDER: SocialNetwork[] = [
  "linkedin",
  "instagram",
  "youtube",
  "tiktok",
  "x",
  "facebook",
];

const ENV_KEY: Record<SocialNetwork, string> = {
  linkedin: "NEXT_PUBLIC_SOCIAL_LINKEDIN",
  instagram: "NEXT_PUBLIC_SOCIAL_INSTAGRAM",
  youtube: "NEXT_PUBLIC_SOCIAL_YOUTUBE",
  tiktok: "NEXT_PUBLIC_SOCIAL_TIKTOK",
  x: "NEXT_PUBLIC_SOCIAL_X",
  facebook: "NEXT_PUBLIC_SOCIAL_FACEBOOK",
};

/**
 * Known accounts. Fill a URL in here (or set the matching env var) and the mark
 * appears in the footer; leave it empty and nothing renders.
 */
const DEFAULTS: Partial<Record<SocialNetwork, string>> = {
  linkedin: "https://www.linkedin.com/company/hansala/",
  instagram: "https://www.instagram.com/hansala.verified",
  youtube: "https://www.youtube.com/@Hansala-verified",
  tiktok: "https://www.tiktok.com/@hansala.verified",
};

/* Read at call time, not at module scope: a module-level constant is captured
   when the bundle is built, which on a server component means the value from
   build time rather than from the running environment. */
export function getSocialLinks(): SocialLink[] {
  const links: SocialLink[] = [];
  for (const network of ORDER) {
    const url =
      process.env[ENV_KEY[network]]?.trim() || DEFAULTS[network]?.trim() || "";
    if (url) links.push({ network, url });
  }
  return links;
}
