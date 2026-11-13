import test from "node:test";
import assert from "node:assert/strict";
import { analyzePost, postSchema } from "../lib/analysis";
import { scenarios } from "../lib/data";
import { simulate, defaults } from "../lib/simulation";
test("each fixture has its own language profile and findings quote its text", () => {
  const reports = scenarios.map((s) => analyzePost(s.text));
  assert.equal(
    new Set(reports.map((r) => r.metrics.map((m) => m.score).join(","))).size,
    4,
  );
  reports.forEach((r) =>
    r.findings.forEach((f) => assert.ok(r.text.includes(f.phrase))),
  );
  assert.ok(reports[0].score >= 60);
  assert.ok(reports[1].findings.some((f) => f.evidence === "Contradicted"));
  assert.ok(reports[2].findings.some((f) => f.evidence === "Supported"));
});
test("custom text gets its own matches and no invented source attribution", () => {
  const r = analyzePost("Buy now before you miss out!");
  assert.equal(r.source, null);
  assert.equal(r.reference, undefined);
  assert.ok(r.metrics[0].score > 0);
  assert.ok(r.findings.every((f) => f.evidence === "Insufficient Evidence"));
  assert.deepEqual(analyzePost(r.text), r);
  const neutral = analyzePost("ขอรายละเอียดเพิ่มเติม");
  assert.equal(neutral.score, 0);
  assert.equal(neutral.findings[0].phrase, neutral.text);
  assert.equal(postSchema.safeParse("  ").success, false);
  assert.equal(postSchema.safeParse("x".repeat(3001)).success, false);
});
test("seeded simulation is reproducible and all paths enter the histogram", () => {
  const out = simulate(defaults);
  assert.deepEqual(simulate(defaults), out);
  assert.equal(
    out.histogram.reduce((a, b) => a + b.count, 0),
    240,
  );
  assert.ok(out.median >= out.downside);
  assert.notEqual(simulate({ ...defaults, vol: 32 }).median, out.median);
  assert.notEqual(
    simulate({ ...defaults, approach: "lump" }).median,
    out.median,
  );
  assert.equal(out.paths.length, defaults.years * 12 + 1);
});
test("all strategies conserve principal in a flat market", () => {
  const out = simulate({ ...defaults, vol: 0, rate: 0 });
  assert.ok(out.comparison.every((c) => c.value === out.contribution));
  assert.equal(out.below, 0);
  assert.equal(out.downside, out.contribution);
});
