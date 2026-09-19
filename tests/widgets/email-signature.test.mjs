import assert from "node:assert/strict";
import test from "node:test";

function esc(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml({ name, slug, hasConfirmed, siteUrl }) {
  const url = `${siteUrl.replace(/\/$/, "")}/c/${slug}`;
  const line = hasConfirmed ? "Confirmed work" : "Company file";
  return `<table role="presentation"><a href="${url}">${esc(name)}</a> — ${line}<a href="${url}">Record on Hansala</a></table>`;
}

test("email signature is static HTML with the record link", () => {
  const html = buildHtml({
    name: "Vera <script>",
    slug: "vera-it",
    hasConfirmed: true,
    siteUrl: "https://www.hansala.com",
  });
  assert.doesNotMatch(html, /<iframe/i);
  assert.match(html, /Record on Hansala/);
  assert.match(html, /Confirmed work/);
  assert.match(html, /https:\/\/www\.hansala\.com\/c\/vera-it/);
  assert.match(html, /Vera &lt;script&gt;/);
});

test("without confirmed work, wording stays a file not a negative", () => {
  const html = buildHtml({
    name: "New Co",
    slug: "new-co",
    hasConfirmed: false,
    siteUrl: "https://www.hansala.com",
  });
  assert.match(html, /Company file/);
  assert.doesNotMatch(html, /not verified|unverified|pending/i);
});
