import assert from "node:assert/strict";
import test from "node:test";
import { FIXTURES } from "../fixtures/synthetic.mjs";

/**
 * Email template / escaping tests (mirror of src/lib/email/template.ts).
 * npm run test:email
 */

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPlainText(content) {
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

function renderBrandedEmail(siteUrl, content) {
  const body = content.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3a423e;">${escapeHtml(p)}</p>`,
    )
    .join("");
  const cta = content.cta
    ? `<a href="${escapeHtml(content.cta.href)}">${escapeHtml(content.cta.label)}</a>`
    : "";
  return `<!DOCTYPE html><html lang="en"><body>${escapeHtml(content.headline)}${body}${cta}<a href="${escapeHtml(siteUrl)}">Hansala</a></body></html>`;
}

function referenceConfirmContent(input) {
  const url = `https://hansala.com/confirm-reference/${input.token}`;
  return {
    subject: `${input.providerName} asks you to confirm a service relationship on Hansala`,
    content: {
      eyebrow: "Reference confirmation",
      headline: "Confirm a service relationship",
      paragraphs: [
        `${input.providerName} says they provide “${input.service}” for ${input.clientName}.`,
        "Confirm only if this reflects an ongoing or past client relationship.",
      ],
      cta: { label: "Confirm reference", href: url },
      finePrint: "If this was unexpected, you can ignore this email.",
    },
  };
}

test("escapeHtml blocks script injection in email body", () => {
  const dirty = `<script>alert("x")</script> & "quotes"`;
  const safe = escapeHtml(dirty);
  assert.equal(safe.includes("<script>"), false);
  assert.equal(safe.includes("&lt;script&gt;"), true);
  assert.equal(safe.includes("&amp;"), true);
  assert.equal(safe.includes("&quot;"), true);
});

test("reference confirmation email uses synthetic names and token path", () => {
  const mail = referenceConfirmContent({
    providerName: FIXTURES.provider.name,
    clientName: FIXTURES.client.name,
    service: "Interior design",
    token: FIXTURES.tokens.confirmReference,
  });
  assert.match(mail.subject, /Northline Studio \(Test\)/);
  assert.equal(
    mail.content.cta.href,
    `https://hansala.com/confirm-reference/${FIXTURES.tokens.confirmReference}`,
  );
  const html = renderBrandedEmail("https://hansala.com", mail.content);
  const text = renderPlainText(mail.content);
  assert.match(html, /Confirm reference/);
  assert.match(text, /Confirm reference:/);
  assert.equal(html.includes("<script>"), false);
  assert.equal(text.includes(FIXTURES.client.email), false);
});

test("XSS attempt in company name is escaped in HTML", () => {
  const html = renderBrandedEmail("https://hansala.com", {
    headline: `Hello <img src=x onerror=alert(1)>`,
    paragraphs: [`From ${FIXTURES.provider.name}`],
    cta: {
      label: "Open",
      href: `javascript:alert(1)`,
    },
  });
  assert.equal(html.includes("<img src=x"), false);
  assert.match(html, /&lt;img src=x/);
  // href is escaped as attribute text — still reject javascript: in product code separately
  assert.match(html, /href="javascript:alert\(1\)"/);
});
