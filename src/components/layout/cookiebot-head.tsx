/** Cookiebot CMP — must load early in `<head>` for auto blocking. */
export function CookiebotHead() {
  const id = process.env.NEXT_PUBLIC_COOKIEBOT_ID?.trim();
  if (!id) return null;

  return (
    <script
      id="Cookiebot"
      src="https://consent.cookiebot.com/uc.js"
      data-cbid={id}
      data-blockingmode="auto"
      type="text/javascript"
    />
  );
}
