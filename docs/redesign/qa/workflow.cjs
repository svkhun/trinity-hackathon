const fs = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
async function run() {
  const [tools, url] = process.argv.slice(2);
  const { chromium } = createRequire(path.resolve(tools, "package.json"))(
    "playwright-core",
  );
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    reducedMotion: "reduce",
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage(),
    checks = [],
    errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const fonts = await page.evaluate(() => ({
      heading: getComputedStyle(document.querySelector("h1")).fontFamily,
      input: getComputedStyle(document.querySelector("textarea")).fontFamily,
      loaded: [...document.fonts]
        .filter((f) => f.status === "loaded")
        .map((f) => [f.family, f.weight]),
    }));
    assert.ok(fonts.heading.includes("Bai Jamjuree"));
    assert.ok(fonts.input.includes("Sarabun"));
    for (const family of ["Bai Jamjuree", "Sarabun"])
      assert.ok(fonts.loaded.some(([name]) => name.includes(family)));
    checks.push("Thai display and body faces loaded from local files");
    const focused = () =>
      page.evaluate(() => document.activeElement?.textContent?.trim());
    await page.keyboard.press("Tab");
    assert.equal(await focused(), "ข้ามไปเนื้อหา");
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(() => document.activeElement.id), "main");
    checks.push("Keyboard skip control enters main");
    await page.reload();
    await page.keyboard.press("Tab");
    for (let i = 0; i < 12 && (await focused()) !== "คู่มือ"; i++)
      await page.keyboard.press("Tab");
    assert.equal(await focused(), "คู่มือ");
    await page.keyboard.press("Enter");
    await page.locator("dialog[open]").waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog[open]").count(), 0);
    assert.equal(await focused(), "คู่มือ");
    checks.push("Keyboard opens guide, Escape closes and restores focus");
    await page.getByRole("button", { name: "อ่านข้อสังเกตของคำนี้" }).focus();
    await page.keyboard.press("Enter");
    const openSummary = page
      .locator("details[open] summary")
      .filter({ hasText: "วงในยืนยันแล้ว" });
    await openSummary.waitFor();
    assert.ok((await focused()).includes("วงในยืนยันแล้ว"));
    await page.keyboard.press("Space");
    assert.equal(await openSummary.count(), 0);
    checks.push(
      "Annotation opens and focuses matching disclosure; Space collapses",
    );
    const select = page.getByRole("combobox", { name: "เลือกกรณีศึกษา" });
    await select.selectOption("custom");
    const submit = page.getByRole("button", { name: "ตรวจโพสต์นี้", exact: true });
    await submit.click();
    await page.locator("#post-error").waitFor();
    assert.equal(await page.evaluate(() => document.activeElement.id), "post");
    checks.push("Empty input announces validation and focuses field");
    await page.locator("#post").fill("Buy now before you miss out!");
    await submit.click();
    await page
      .locator("#analysis-result blockquote")
      .filter({ hasText: "Buy now" })
      .waitFor();
    await page.getByRole("button", { name: "หลักฐานอ้างอิง" }).click();
    await page
      .getByText("ยังไม่มีหลักฐานต้นทางสำหรับข้อความนี้", { exact: true })
      .waitFor();
    checks.push("Custom input and insufficient evidence");
    await select.selectOption("education");
    await submit.click();
    await page
      .locator("#analysis-result blockquote")
      .filter({ hasText: "DCA" })
      .waitFor();
    await page.getByRole("button", { name: /ข้อสังเกต \(/ }).click();
    await page.getByText("Supported", { exact: true }).waitFor();
    await page.getByRole("button", { name: "คัดลอกสรุปผล" }).click();
    assert.ok(
      (await page.evaluate(() => navigator.clipboard.readText())).includes(
        "12,000",
      ),
    );
    checks.push("Supported fixture, reanalysis and copied report");
    await page.getByRole("button", { name: "ดู AI Signals" }).click();
    await page
      .getByRole("heading", { name: "AI-Generated Content Signals" })
      .waitFor();
    await page
      .getByRole("button", { name: "ตรวจ Source Intelligence" })
      .click();
    await page.getByRole("heading", { name: "Market Learning Desk" }).waitFor();
    await page.getByRole("button", { name: "ครีเอเตอร์การลงทุน" }).click();
    await page.getByRole("heading", { name: "Baht Notes Studio" }).waitFor();
    checks.push(
      "Report persists through analytics and source profile switching",
    );
    await page.getByRole("button", { name: "เปิด RiskLab" }).click();
    const slider = page.getByRole("slider").first();
    await slider.waitFor();
    const before = await page.locator(".sim-values").innerText();
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    assert.notEqual(await page.locator(".sim-values").innerText(), before);
    await page.getByRole("combobox").selectOption("lump");
    await page.getByRole("button", { name: "คืนค่าเริ่มต้น" }).click();
    assert.equal(await page.locator(".sim-values").innerText(), before);
    checks.push("Keyboard slider, approach selection and reset");
    await page.goBack();
    await page
      .getByRole("heading", { name: "Source Intelligence", exact: true })
      .waitFor();
    checks.push("Browser Back resolves hash navigation");
    const reduced = await page.evaluate(() => ({
      enabled: matchMedia("(prefers-reduced-motion: reduce)").matches,
      transition: getComputedStyle(document.querySelector("button"))
        .transitionDuration,
      animations: document
        .getAnimations()
        .filter((a) => a.playState === "running").length,
    }));
    assert.ok(reduced.enabled);
    assert.equal(reduced.transition, "0s");
    assert.equal(reduced.animations, 0);
    checks.push(
      "Reduced motion enabled, zero transition duration, no active animations",
    );
    const layout = [],
      accessibility = [];
    const axePath = createRequire(path.resolve(tools, "package.json")).resolve(
      "axe-core/axe.min.js",
    );
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
      for (const view of [
        "overview",
        "fact-check",
        "ai-analysis",
        "sources",
        "risklab",
      ]) {
        await page.goto(url + "/#" + view);
        await page
          .locator(
            view === "overview"
              ? ".lead"
              : view === "fact-check"
                ? ".report"
                : view === "sources"
                  ? ".timeline"
                  : view === "risklab"
                    ? ".sim-values"
                    : ".metric-grid",
          )
          .waitFor();
        const result = await page.evaluate(() => ({
          width: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
        }));
        assert.ok(
          result.documentWidth <= width,
          view + " overflows at " + width,
        );
        layout.push({ view, ...result });
        if (width === 1440 || width === 390) {
          await page.addScriptTag({ path: axePath });
          const violations = await page.evaluate(async () => {
            const r = await window.axe.run(document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
              },
            });
            return r.violations.map((v) => ({
              rule: v.id,
              nodes: v.nodes.map((n) => n.target),
            }));
          });
          accessibility.push({ view, width, violations });
        }
      }
    }
    assert.deepEqual(errors, []);
    checks.push("All five routes fit three widths; no uncaught page errors");
    await fs.writeFile(
      path.resolve(__dirname, "../evidence/after/workflow.json"),
      JSON.stringify(
        { checks, fonts, reduced, layout, accessibility, errors },
        null,
        2,
      ),
    );
    console.log(checks);
  } finally {
    await browser.close();
  }
}
run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
