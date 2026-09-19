import assert from "node:assert/strict";
import test from "node:test";

function csvCell(value) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function csvLine(cells) {
  return cells.map((c) => csvCell(c == null ? "" : String(c))).join(",");
}

test("quotes commas and doubles inner quotes", () => {
  assert.equal(csvCell("Acme, Inc"), '"Acme, Inc"');
  assert.equal(csvCell('Say "hi"'), '"Say ""hi"""');
  assert.equal(csvCell("plain"), "plain");
});

test("partner row matches public API columns plus record_url", () => {
  const header = "id,name,slug,verified,confirmed_at,record_url";
  const line = csvLine([
    "11111111-1111-4111-8111-111111111111",
    "Acme, Inc",
    "acme",
    true,
    "2026-09-01T12:00:00.000Z",
    "https://www.hansala.com/c/vera/with/acme",
  ]);
  const csv = `${header}\n${line}\n`;
  assert.match(csv, /^id,name,slug,verified,confirmed_at,record_url\n/);
  assert.match(csv, /"Acme, Inc"/);
  assert.doesNotMatch(csv, /pending/);
});
