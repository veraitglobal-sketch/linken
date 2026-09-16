import Script from "next/script";

/** Cookiebot CMP — beforeInteractive injects into `<head>` for auto blocking. */
export function CookiebotHead() {
  const id = process.env.NEXT_PUBLIC_COOKIEBOT_ID?.trim();
  if (!id) return null;

  return (
    <Script
      id="Cookiebot"
      src="https://consent.cookiebot.com/uc.js"
      strategy="beforeInteractive"
      data-cbid={id}
      data-blockingmode="auto"
      suppressHydrationWarning
    />
  );
}
