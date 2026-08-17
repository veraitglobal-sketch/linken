import type { ReactNode } from "react";

/**
 * Minimal chrome — widgets sit in customer iframes.
 *
 * The transparency has to be declared on `html` and `body`, not just on a
 * wrapper. The root layout ships `body{background:#fff}` as critical inline CSS
 * and `globals.css` repeats it, so every embed document painted an opaque white
 * rectangle behind the widget. On the customer's page that reads as a white
 * slab sitting on their background — the one thing an embed must never do,
 * however transparent our own elements are.
 *
 * `!important` because it is overriding that inline critical CSS, and this
 * style only ever loads inside `/embed`, so it cannot reach the site itself.
 * The iframe still needs `allowtransparency`/`background:transparent` on the
 * host side, which `buildEmbedSnippet` already emits.
 */
const TRANSPARENT_GROUND = `
html, body {
  background: transparent !important;
  background-color: transparent !important;
  /* globals.css sets color-scheme:light on html, which makes the browser paint
     an opaque canvas for the document even when its background is transparent —
     so the iframe still landed as a white rectangle on the host page. normal is
     what lets the canvas actually stay see-through.
     (No backticks in here: this string is a template literal, and one inside
     the comment closes it early — which is exactly what just happened.) */
  color-scheme: normal !important;
}
`;

export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: TRANSPARENT_GROUND }} />
      <div className="m-0 min-h-full bg-transparent p-0">{children}</div>
    </>
  );
}
