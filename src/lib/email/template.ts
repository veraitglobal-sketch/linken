/** Branded Hansala transactional email HTML (inline CSS for client support). */

export type BrandedEmailContent = {
  eyebrow?: string;
  headline: string;
  paragraphs: string[];
  cta?: { label: string; href: string };
  finePrint?: string;
};

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderPlainText(content: BrandedEmailContent) {
  const lines = [content.headline, "", ...content.paragraphs];
  if (content.cta) {
    lines.push("", `${content.cta.label}:`, content.cta.href);
  }
  if (content.finePrint) {
    lines.push("", content.finePrint);
  }
  lines.push("", "— Hansala", "https://hansala.com");
  return lines.join("\n");
}

export function renderBrandedEmail(siteUrl: string, content: BrandedEmailContent) {
  const eyebrow = content.eyebrow ?? "Hansala";
  const body = content.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3a423e;">${escapeHtml(p)}</p>`,
    )
    .join("");

  const cta = content.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
        <tr>
          <td style="border-radius:8px;background:#0e1f1c;">
            <a href="${escapeHtml(content.cta.href)}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">${escapeHtml(content.cta.label)}</a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 4px;font-size:12px;line-height:1.5;color:#66706b;word-break:break-all;">${escapeHtml(content.cta.href)}</p>`
    : "";

  const finePrint = content.finePrint
    ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#66706b;">${escapeHtml(content.finePrint)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f2f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f0;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e6e3;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:28px 32px 20px;background:#0e1f1c;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#7eb8a4;">${escapeHtml(eyebrow)}</p>
            <p style="margin:0;font-size:22px;font-weight:600;line-height:1.25;color:#ffffff;letter-spacing:-0.02em;">${escapeHtml(content.headline)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 32px;">
            ${body}
            ${cta}
            ${finePrint}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e2e6e3;background:#f1f3f1;">
            <p style="margin:0;font-size:12px;color:#66706b;">
              <a href="${escapeHtml(siteUrl)}" style="color:#1a5c51;font-weight:600;text-decoration:none;">Hansala</a>
              · Verified B2B company profiles
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
