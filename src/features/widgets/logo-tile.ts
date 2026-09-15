import "server-only";
import sharp from "sharp";

/**
 * Normalise a partner logo for widgets: one transparent image per logo, all
 * the same optical size, in the tone the wall asks for.
 *
 * 1. Rasterise (SVG included) with an alpha channel.
 * 2. If the corners agree on one opaque colour, that colour is the logo's
 *    backdrop — key it out with a soft edge so "logo on a white box" becomes
 *    just the logo.
 * 3. Trim the empty margin, then place the mark on a fixed canvas scaled by
 *    area, not by height, so a square icon and a long wordmark read at the same
 *    weight.
 * 4. Optionally recolour every visible pixel to one ink, keeping alpha.
 */

export const TILE_W = 480;
export const TILE_H = 200;
/** Share of the canvas area a logo may cover after normalising. */
const AREA = 0.16;
/** Share of the canvas the visible ink of a logo should cover. */
const INK_AREA = 0.075;

import type { LogoTone } from "@/features/widgets/logo-tile-url";
export type { LogoTone };
export { isAllowedLogoSourceUrl as isAllowedLogoSource, logoTileUrl } from "@/features/widgets/logo-tile-url";

const INK: Record<Exclude<LogoTone, "original">, [number, number, number]> = {
  ink: [13, 18, 16],
  white: [255, 255, 255],
};

export async function normaliseLogo(input: Buffer, tone: LogoTone): Promise<Buffer> {
  const { data, info } = await sharp(input, { density: 300, limitInputPixels: 40_000_000 })
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: false })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  const px = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
  const at = (x: number, y: number) => (y * w + x) * 4;

  // 2. Backdrop from the corners (a 3×3 sample at each).
  const samples: number[][] = [];
  for (const [cx, cy] of [
    [1, 1],
    [w - 2, 1],
    [1, h - 2],
    [w - 2, h - 2],
  ] as const) {
    const i = at(cx, cy);
    samples.push([px[i]!, px[i + 1]!, px[i + 2]!, px[i + 3]!]);
  }
  const opaque = samples.filter((s) => s[3]! > 240);
  if (opaque.length >= 3) {
    const bg = [0, 1, 2].map((k) => opaque.reduce((a, s) => a + s[k]!, 0) / opaque.length);
    const agree = opaque.every((s) => Math.hypot(s[0]! - bg[0]!, s[1]! - bg[1]!, s[2]! - bg[2]!) < 24);
    if (agree) {
      for (let i = 0; i < px.length; i += 4) {
        const d = Math.hypot(px[i]! - bg[0]!, px[i + 1]! - bg[1]!, px[i + 2]! - bg[2]!);
        if (d < 28) px[i + 3] = 0;
        else if (d < 70) px[i + 3] = Math.round(px[i + 3]! * ((d - 28) / 42));
      }
    }
  }

  // 4. Tone. A one-colour logo keeps its inner detail: the light parts of the
  // mark (a white letter inside a coloured badge) become cut-outs, so a badge
  // turns into a ring with a hole instead of a solid block.
  if (tone !== "original") {
    const lum: number[] = [];
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3]! > 160) lum.push(0.2126 * px[i]! + 0.7152 * px[i + 1]! + 0.0722 * px[i + 2]!);
    }
    lum.sort((a, b) => a - b);
    const dark = lum[Math.floor(lum.length * 0.1)] ?? 0;
    const light = lum[Math.floor(lum.length * 0.97)] ?? 255;
    const knockout = light - dark > 70;
    const [r, g, b] = INK[tone];
    for (let i = 0; i < px.length; i += 4) {
      if (knockout && px[i + 3]! > 0) {
        const l = 0.2126 * px[i]! + 0.7152 * px[i + 1]! + 0.0722 * px[i + 2]!;
        // Darkest → fully drawn; within 18% of the lightest → cut out.
        const t = Math.min(1, Math.max(0, (light - l) / Math.max(1, (light - dark) * 0.82)));
        px[i + 3] = Math.round(px[i + 3]! * t);
      }
      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
    }
  }

  // 3. Trim transparent margin.
  const keyed = sharp(Buffer.from(px.buffer, px.byteOffset, px.byteLength), { raw: { width: w, height: h, channels: 4 } });
  let trimmed: { data: Buffer; info: sharp.OutputInfo };
  try {
    trimmed = await keyed.png().trim({ threshold: 8 }).toBuffer({ resolveWithObject: true });
  } catch {
    trimmed = await keyed.png().toBuffer({ resolveWithObject: true });
  }
  const tw = Math.max(1, trimmed.info.width);
  const th = Math.max(1, trimmed.info.height);

  // Same visual weight for every logo: scale by the box *and* by how much ink
  // the mark actually has, so a thin script wordmark is not dwarfed by a bold
  // badge. Bounded by the canvas with a little air.
  const { data: tpx } = await sharp(trimmed.data).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let ink = 0;
  for (let i = 3; i < tpx.length; i += 4) ink += tpx[i]! / 255;
  const boxScale = Math.sqrt((TILE_W * TILE_H * AREA) / (tw * th));
  const inkScale = Math.sqrt((TILE_W * TILE_H * INK_AREA) / Math.max(1, ink));
  const scale = Math.sqrt(boxScale * inkScale);
  let ow = tw * scale;
  let oh = th * scale;
  const fit = Math.min(1, (TILE_W * 0.9) / ow, (TILE_H * 0.78) / oh);
  ow = Math.max(1, Math.round(ow * fit));
  oh = Math.max(1, Math.round(oh * fit));

  const mark = await sharp(trimmed.data).resize(ow, oh, { fit: "fill" }).png().toBuffer();
  return sharp({
    create: { width: TILE_W, height: TILE_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: mark, left: Math.round((TILE_W - ow) / 2), top: Math.round((TILE_H - oh) / 2) }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}
