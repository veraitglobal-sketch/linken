import assert from "node:assert/strict";
import test from "node:test";

function parseOfferId(raw) {
  return raw === "six" || raw === "year" ? raw : null;
}

test("offer ids are six and year only", () => {
  assert.equal(parseOfferId("six"), "six");
  assert.equal(parseOfferId("year"), "year");
  assert.equal(parseOfferId("month"), null);
  assert.equal(parseOfferId(""), null);
});
