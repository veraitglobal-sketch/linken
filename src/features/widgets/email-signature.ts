function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function profileUrl(siteUrl: string, slug: string) {
  return `${siteUrl.replace(/\/$/, "")}/c/${slug}`;
}

/** Static HTML for Gmail/Outlook. Iframes are stripped by mail clients. */
export function buildEmailSignatureHtml(input: {
  name: string;
  slug: string;
  hasConfirmed: boolean;
  siteUrl: string;
}): string {
  const url = profileUrl(input.siteUrl, input.slug);
  const name = esc(input.name.trim() || input.slug);
  const line = input.hasConfirmed ? "Confirmed work" : "Company file";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
  <tr>
    <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#0d1210">
      <span style="color:#7eb8a4">✓</span>
      <a href="${url}" style="color:#0d1210;text-decoration:none;font-weight:600">${name}</a>
      — ${line}<br>
      <a href="${url}" style="color:#66706b;text-decoration:underline;font-size:12px">Record on Hansala</a>
    </td>
  </tr>
</table>`;
}

export function buildEmailSignaturePlain(input: {
  name: string;
  slug: string;
  hasConfirmed: boolean;
  siteUrl: string;
}): string {
  const url = profileUrl(input.siteUrl, input.slug);
  const name = input.name.trim() || input.slug;
  const line = input.hasConfirmed ? "Confirmed work" : "Company file";
  return `✓ ${name} — ${line}\n${url}`;
}
