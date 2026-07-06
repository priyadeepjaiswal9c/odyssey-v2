#!/usr/bin/env node
/**
 * Headless visual verification for Kalpana.
 * Launches system Chrome headless (real WebGL via ANGLE/Metal), loads the
 * dev server, screenshots the start menu and every tour stop via the
 * dev-only __kalpana hook. Output: /tmp/kalpana-shots/*.png
 *
 * Usage: node scripts/shot.mjs [--url http://localhost:3000] [--stop N]
 */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "fs";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "/tmp/kalpana-shots";
const url =
  process.argv.includes("--url")
    ? process.argv[process.argv.indexOf("--url") + 1]
    : "http://localhost:3000";
const onlyStop = process.argv.includes("--stop")
  ? parseInt(process.argv[process.argv.indexOf("--stop") + 1], 10)
  : null;

mkdirSync(OUT, { recursive: true });

// HEADED but isolated: R3F v9 defers canvas init until the page is visible,
// so headless/hidden stalls pre-boot. A visible window boots it; after boot,
// the dev __kalpana.render() hook advances frames manually, so screenshots
// stay deterministic even if this window later gets covered.
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  userDataDir: "/tmp/kalpana-chrome-profile",
  args: [
    "--window-size=1456,900",
    "--window-position=40,40",
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--mute-audio",
  ],
  defaultViewport: { width: 1440, height: 810, deviceScaleFactor: 1 },
});

try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text().slice(0, 200)}`);
  });

  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  // wait for the world hook (canvas booted, stops registered)
  try {
    await page.waitForFunction(
      () => window.__kalpana && window.__frames > 5,
      { timeout: 45000, polling: 250 }
    );
  } catch {
    const st = await page.evaluate(() => ({
      kalpana: typeof window.__kalpana,
      frames: window.__frames ?? 0,
      errs: (window.__errs || []).slice(0, 8),
      vis: document.visibilityState,
      canvas: !!document.querySelector("canvas"),
    }));
    console.log("BOOT FAILED:", JSON.stringify(st, null, 1));
    console.log("console errors:", [...new Set(errors)].slice(0, 10).join("\n  "));
    await page.screenshot({ path: `${OUT}/boot-failed.png` });
    console.log(`(screenshot: ${OUT}/boot-failed.png)`);
    await browser.close();
    process.exit(1);
  }
  // let meshes/env/compose settle
  await new Promise((r) => setTimeout(r, 2500));

  // 1 — start menu over the live world
  if (onlyStop === null) {
    await page.screenshot({ path: `${OUT}/00-menu.png` });
    console.log("✓ 00-menu.png");
  }

  // count stops
  const stopCount = await page.evaluate(() => {
    let n = 0;
    while (window.__kalpana.snap(n).startsWith("snapped")) n++;
    return n;
  });

  const targets =
    onlyStop === null
      ? Array.from({ length: stopCount }, (_, i) => i)
      : [onlyStop];

  for (const i of targets) {
    const label = await page.evaluate((idx) => window.__kalpana.snap(idx), i);
    // realm mount + geometry build, then force frames (twice, belt+braces)
    await new Promise((r) => setTimeout(r, 2200));
    await page.evaluate(() => window.__kalpana.render(4));
    await new Promise((r) => setTimeout(r, 700));
    await page.evaluate(() => window.__kalpana.render(4));
    await new Promise((r) => setTimeout(r, 200));
    const name = `${String(i + 1).padStart(2, "0")}-${label.replace("snapped to ", "")}.png`;
    await page.screenshot({ path: `${OUT}/${name}` });
    console.log(`✓ ${name}`);
  }

  if (errors.length) {
    console.log("\n⚠ page errors:");
    for (const e of [...new Set(errors)].slice(0, 10)) console.log("  " + e);
  } else {
    console.log("\n✓ no page errors");
  }
} finally {
  await browser.close();
}
