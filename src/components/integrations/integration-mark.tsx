import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The provider mark, inlined into the document.
 *
 * It was an `<img>` pointing at `/logos/integrations/*.svg`, and the Slack one
 * would not paint in Safari however sound the file was — served bytes validated
 * as XML, matched disk exactly, carried the right content type, and loaded fine
 * in a Chromium check. Rather than keep guessing at a browser I cannot
 * reproduce, this removes the mechanism: no second request, so no content-type
 * negotiation, no cache entry, no `nosniff` interaction and no per-browser image
 * decoding. The mark becomes part of the page.
 *
 * The files stay the single source of truth — they are read at render time, not
 * copied into TSX, so replacing a logo is still just replacing the file.
 *
 * `dangerouslySetInnerHTML` is safe here in the strict sense: the input is a
 * fixed filename resolved against our own repo, never anything a user supplies.
 * `ALLOWED` exists so it stays that way if someone later passes a variable in.
 */

const ALLOWED = ["slack", "calendly", "calcom"] as const;
export type IntegrationMarkName = (typeof ALLOWED)[number];

function load(name: IntegrationMarkName): string {
  const file = join(process.cwd(), "public", "logos", "integrations", `${name}.svg`);
  return readFileSync(file, "utf8");
}

export function IntegrationMark({
  name,
  size = 26,
}: {
  name: IntegrationMarkName;
  size?: number;
}) {
  if (!ALLOWED.includes(name)) return null;

  /* Sized on the wrapper rather than by editing the markup: every one of these
     carries a viewBox and no width/height, so the SVG fills whatever box it is
     given and stays crisp at any size. */
  return (
    <span
      aria-hidden
      className="[&>svg]:block [&>svg]:h-full [&>svg]:w-full"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: load(name) }}
    />
  );
}
